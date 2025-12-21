'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { RenderPageProps, SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import type {
  HighlightArea,
  RenderHighlightContentProps,
  RenderHighlightTargetProps,
} from '@react-pdf-viewer/highlight';
import { Trigger, highlightPlugin } from '@react-pdf-viewer/highlight';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCirclePlus,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  ANNOTATION_COLORS,
  HighlightArea as StoredHighlightArea,
  usePdfAnnotationsStore,
} from '@/stores/pdfAnnotationsStore';

import TextSelectionPopup from './TextSelectionPopup';

// Separate component for rendering highlights on a single page
// This component subscribes to the store directly, so it re-renders when annotations change
interface PageHighlightsProps {
  pageIndex: number;
  articleSlug: string;
  pdfUrl: string;
  scale: number;
  rotation: number;
}

const PageHighlights: React.FC<PageHighlightsProps> = ({
  pageIndex,
  articleSlug,
  pdfUrl,
  scale,
  rotation,
}) => {
  const { annotations, getAnnotationsForPdf } = usePdfAnnotationsStore();

  // Get annotations for this page
  const pageAnnotations = useMemo(() => {
    const allAnnotations = getAnnotationsForPdf(articleSlug, pdfUrl);
    return allAnnotations.filter((annotation) =>
      annotation.highlightAreas.some((area) => area.pageIndex === pageIndex)
    );
  }, [articleSlug, pdfUrl, pageIndex, annotations, getAnnotationsForPdf]);

  if (pageAnnotations.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 1 }}>
      {pageAnnotations.map((annotation) => (
        <React.Fragment key={annotation.id}>
          {annotation.highlightAreas
            .filter((area) => area.pageIndex === pageIndex)
            .map((area, idx) => (
              <div
                key={`${annotation.id}-${idx}`}
                className="pointer-events-auto absolute cursor-pointer transition-opacity hover:opacity-80"
                style={{
                  left: `${area.left}%`,
                  top: `${area.top}%`,
                  width: `${area.width}%`,
                  height: `${area.height}%`,
                  backgroundColor: ANNOTATION_COLORS[annotation.color].hex,
                  opacity: 0.4,
                  mixBlendMode: 'multiply',
                }}
                title={annotation.note || annotation.selectedText}
              />
            ))}
        </React.Fragment>
      ))}
    </div>
  );
};

interface PDFViewerContainerProps {
  pdfUrl: string;
  articleSlug: string;
  onQuoteSelect?: (text: string) => void;
  onJumpToAnnotationReady?: (jumpFn: (area: HighlightArea) => void) => void;
}

const PDFViewerContainer: React.FC<PDFViewerContainerProps> = ({
  pdfUrl,
  articleSlug,
  onQuoteSelect,
  onJumpToAnnotationReady,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);

  // Render the highlight target (the tooltip that appears when selecting text)
  const renderHighlightTarget = useCallback(
    (props: RenderHighlightTargetProps) => (
      <div
        style={{
          background: '#eee',
          display: 'flex',
          position: 'absolute',
          left: `${props.selectionRegion.left}%`,
          top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
          transform: 'translate(0, 8px)',
          zIndex: 1,
        }}
      >
        <Button variant="blue" size="sm" onClick={props.toggle} className="p-1.5">
          <MessageCirclePlus size={20} />
        </Button>
      </div>
    ),
    []
  );

  // Render highlight content (popup when text is selected and user clicks "Add note")
  const renderHighlightContent = useCallback(
    (props: RenderHighlightContentProps) => {
      const { selectedText, highlightAreas, selectionRegion, cancel } = props;

      if (!selectedText.trim()) {
        return <></>;
      }

      // Convert highlight areas to our stored format
      const storedAreas: StoredHighlightArea[] = highlightAreas.map((area) => ({
        height: area.height,
        left: area.left,
        pageIndex: area.pageIndex,
        top: area.top,
        width: area.width,
      }));

      return (
        <TextSelectionPopup
          selectedText={selectedText.trim()}
          highlightAreas={storedAreas}
          articleSlug={articleSlug}
          pdfUrl={pdfUrl}
          pageIndex={highlightAreas[0]?.pageIndex || 0}
          selectionRegion={selectionRegion}
          onClose={cancel}
          onQuoteSelect={onQuoteSelect}
        />
      );
    },
    [articleSlug, pdfUrl, onQuoteSelect]
  );

  // Custom page renderer that adds highlight overlay to each page
  // This component subscribes to the store, so highlights update without reloading the PDF
  const renderPage = useCallback(
    (props: RenderPageProps) => (
      <>
        {props.canvasLayer.children}
        {props.textLayer.children}
        {props.annotationLayer.children}
        <PageHighlights
          pageIndex={props.pageIndex}
          articleSlug={articleSlug}
          pdfUrl={pdfUrl}
          scale={props.scale}
          rotation={props.rotation}
        />
      </>
    ),
    [articleSlug, pdfUrl]
  );

  // Store plugin instances in refs to maintain stable references
  const zoomPluginRef = useRef(zoomPlugin());
  const pageNavigationPluginRef = useRef(pageNavigationPlugin());
  // Highlight plugin only handles text selection - rendering is done via renderPage
  const highlightPluginRef = useRef(
    highlightPlugin({
      trigger: Trigger.TextSelection,
      renderHighlightTarget,
      renderHighlightContent,
    })
  );

  // Get stable plugin instances
  const zoomPluginInstance = zoomPluginRef.current;
  const pageNavigationPluginInstance = pageNavigationPluginRef.current;
  const highlightPluginInstance = highlightPluginRef.current;

  // Get plugin components
  const { ZoomIn: ZoomInButton, ZoomOut: ZoomOutButton, CurrentScale } = zoomPluginInstance;
  const { CurrentPageLabel, GoToNextPage, GoToPreviousPage, NumberOfPages } =
    pageNavigationPluginInstance;

  // Store the callback ref to avoid infinite loops
  const onJumpToAnnotationReadyRef = useRef(onJumpToAnnotationReady);
  useEffect(() => {
    onJumpToAnnotationReadyRef.current = onJumpToAnnotationReady;
  }, [onJumpToAnnotationReady]);

  // Expose jump to annotation function - only run once on mount
  useEffect(() => {
    if (onJumpToAnnotationReadyRef.current) {
      onJumpToAnnotationReadyRef.current((area) => {
        highlightPluginInstance.jumpToHighlightArea(area);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full flex-col bg-common-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-common-minimal bg-common-cardBackground px-3 py-2">
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <ZoomOutButton>
            {(props) => (
              <Button
                variant="transparent"
                size="sm"
                onClick={props.onClick}
                className="h-8 w-8 p-0"
                title="Zoom out"
              >
                <ZoomOut size={16} />
              </Button>
            )}
          </ZoomOutButton>

          <CurrentScale>
            {(props) => (
              <span className="min-w-[60px] text-center text-sm text-text-secondary">
                {Math.round(props.scale * 100)}%
              </span>
            )}
          </CurrentScale>

          <ZoomInButton>
            {(props) => (
              <Button
                variant="transparent"
                size="sm"
                onClick={props.onClick}
                className="h-8 w-8 p-0"
                title="Zoom in"
              >
                <ZoomIn size={16} />
              </Button>
            )}
          </ZoomInButton>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <GoToPreviousPage>
            {(props) => (
              <Button
                variant="transparent"
                size="sm"
                onClick={props.onClick}
                disabled={props.isDisabled}
                className="h-8 w-8 p-0"
                title="Previous page"
              >
                <ChevronLeft size={16} />
              </Button>
            )}
          </GoToPreviousPage>

          <span className="min-w-[80px] text-center text-sm text-text-secondary">
            <CurrentPageLabel>{(props) => <span>{props.currentPage + 1}</span>}</CurrentPageLabel>
            {' / '}
            <NumberOfPages>{(props) => <span>{props.numberOfPages}</span>}</NumberOfPages>
          </span>

          <GoToNextPage>
            {(props) => (
              <Button
                variant="transparent"
                size="sm"
                onClick={props.onClick}
                disabled={props.isDisabled}
                className="h-8 w-8 p-0"
                title="Next page"
              >
                <ChevronRight size={16} />
              </Button>
            )}
          </GoToNextPage>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="relative flex-1 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-common-background">
            <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
          </div>
        )}

        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div className="h-full">
            <Viewer
              fileUrl={pdfUrl}
              plugins={[zoomPluginInstance, pageNavigationPluginInstance, highlightPluginInstance]}
              defaultScale={SpecialZoomLevel.PageWidth}
              renderPage={renderPage}
              onDocumentLoad={() => {
                setIsLoading(false);
              }}
            />
          </div>
        </Worker>
      </div>
    </div>
  );
};

export default PDFViewerContainer;
