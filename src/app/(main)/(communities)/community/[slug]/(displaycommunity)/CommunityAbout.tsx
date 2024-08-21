import { useMemo } from 'react';

import Accordion from '@yoopta/accordion';
import Blockquote from '@yoopta/blockquote';
import Callout from '@yoopta/callout';
import YooptaEditor, { YooptaContentValue, createYooptaEditor } from '@yoopta/editor';
import { HeadingOne, HeadingThree, HeadingTwo } from '@yoopta/headings';
import Link from '@yoopta/link';
import { BulletedList, NumberedList, TodoList } from '@yoopta/lists';
import Paragraph from '@yoopta/paragraph';

interface CommunityAboutProps {
  about: YooptaContentValue;
}

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

const CommunityAbout: React.FC<CommunityAboutProps> = ({ about }) => {
  const editor = useMemo(() => createYooptaEditor(), []);

  return (
    <div className="">
      {Object.keys(about).length === 0 && about.constructor === Object && (
        <p className="py-4 text-center text-gray-500">
          No about content available for this community
        </p>
      )}
      <YooptaEditor
        editor={editor}
        value={about}
        plugins={plugins}
        style={{ width: '100%' }}
        readOnly
      />
    </div>
  );
};

export default CommunityAbout;
