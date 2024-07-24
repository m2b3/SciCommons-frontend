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
  console.log(about);
  const editor = useMemo(() => createYooptaEditor(), []);

  return (
    <div className="">
      <YooptaEditor
        editor={editor}
        value={about}
        // @ts-expect-error Property 'plugins' does not exist on type 'Props'.
        plugins={plugins}
        style={{ width: '100%' }}
        readOnly
      />
    </div>
  );
};

export default CommunityAbout;
