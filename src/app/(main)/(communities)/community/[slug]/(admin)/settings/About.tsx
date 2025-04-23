import { useMemo, useRef } from 'react';

import Accordion from '@yoopta/accordion';
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Blockquote from '@yoopta/blockquote';
import Callout from '@yoopta/callout';
import YooptaEditor, { YooptaContentValue, createYooptaEditor } from '@yoopta/editor';
import { HeadingOne, HeadingThree, HeadingTwo } from '@yoopta/headings';
import Link from '@yoopta/link';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';
import { BulletedList, NumberedList, TodoList } from '@yoopta/lists';
import { Bold, CodeMark, Highlight, Italic, Strike, Underline } from '@yoopta/marks';
import Paragraph from '@yoopta/paragraph';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import { AxiosResponse } from 'axios';
import { toast } from 'sonner';

import { useCommunitiesApiUpdateCommunity } from '@/api/communities/communities';
import { CommunityOut, UpdateCommunityDetails } from '@/api/schemas';
import Button from '@/components/common/Button';
import { useAuthStore } from '@/stores/authStore';

const plugins = [
  Paragraph,
  Accordion,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  Blockquote,
  Callout,
  NumberedList,
  BulletedList,
  TodoList,
  Link,
];

const TOOLS = {
  ActionMenu: {
    render: DefaultActionMenuRender,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: DefaultToolbarRender,
    tool: Toolbar,
  },
  LinkTool: {
    render: DefaultLinkToolRender,
    tool: LinkTool,
  },
};

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

interface AboutProps {
  data: AxiosResponse<CommunityOut> | undefined;
}

const About: React.FC<AboutProps> = ({ data }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const editor = useMemo(() => createYooptaEditor(), []);
  const selectionRef = useRef(null);

  const { mutate, isPending } = useCommunitiesApiUpdateCommunity({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        toast.success('Community Details updated successfully');
      },
      onError: (error) => {
        toast.error(`${error.response?.data.message}`);
      },
    },
  });

  const sendToBackend = () => {
    const content = editor.getEditorValue();
    if (content && data) {
      const dataToSend: UpdateCommunityDetails = {
        description: data.data.description,
        // tags: data.data.tags,
        type: data.data.type,
        rules: data.data.rules,
        // about: content,
      };

      mutate({ communityId: data.data.id, data: { payload: { details: dataToSend } } });
    }
  };

  return (
    <div>
      <div className="my-4 w-full bg-white-primary p-16 res-text-sm" ref={selectionRef}>
        <YooptaEditor
          editor={editor}
          plugins={plugins}
          tools={TOOLS}
          marks={MARKS}
          selectionBoxRoot={selectionRef}
          value={data?.data.about as YooptaContentValue}
          style={{ width: '100%' }}
        />
      </div>
      <Button onClick={sendToBackend} isPending={isPending}>
        Save Content
      </Button>
    </div>
  );
};

export default About;
