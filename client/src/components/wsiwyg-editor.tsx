import { useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["link", "image"],
    [{ color: [] }, { background: [] }],
    ["blockquote", "code-block"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "indent",
  "align",
  "link",
  "image",
  "color",
  "background",
  "blockquote",
  "code-block",
];

export default function WysiwygEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className = "",
}: WysiwygEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  return (
    <div className={`wysiwyg-editor ${className}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          minHeight: "200px",
        }}
      />
      <style jsx global>{`
        .wysiwyg-editor .ql-editor {
          min-height: 200px;
          font-size: 14px;
          line-height: 1.6;
        }
        .wysiwyg-editor .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          border-color: #e2e8f0;
        }
        .wysiwyg-editor .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          border-color: #e2e8f0;
        }
        .wysiwyg-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}