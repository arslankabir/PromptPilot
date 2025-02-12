//@ts-nocheck
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const EditorComponent = ({ editorState, setEditorState }) => {
  const onChange = async (value) => {
    setEditorState(value);
  };

  return (
    <div>
      <Editor
        editorState={editorState}
        toolbarClassName="editor-toolbar"
        wrapperClassName="editor-wrapper"
        editorClassName="editor-content"
        onEditorStateChange={(value) => {
          onChange(value);
        }}
        stripPastedStyles
      />
    </div>
  );
};
export default EditorComponent;
