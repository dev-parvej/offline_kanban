import React, { useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDarkMode?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter description...",
  isDarkMode = false
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*'); // Only allow images, no videos
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        // Convert image to base64 for now (in a real app, you'd upload to a server)
        const reader = new FileReader();
        reader.onload = () => {
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection();
            const index = range ? range.index : quill.getLength();
            quill.insertEmbed(index, 'image', reader.result, 'user');
            quill.setSelection(index + 1);
          }
        };
        reader.readAsDataURL(file);
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), []);

  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'image'
  ];

  return (
    <div className={`rich-text-editor ${isDarkMode ? 'dark-mode' : ''}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{
          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
        }}
      />
      <style jsx>{`
        .rich-text-editor.dark-mode .ql-toolbar {
          border-color: #4b5563;
          background-color: #374151;
        }
        .rich-text-editor.dark-mode .ql-container {
          border-color: #4b5563;
          background-color: #374151;
        }
        .rich-text-editor.dark-mode .ql-editor {
          color: #f3f4f6;
        }
        .rich-text-editor.dark-mode .ql-editor.ql-blank::before {
          color: #9ca3af;
        }
        .rich-text-editor.dark-mode .ql-toolbar .ql-stroke {
          stroke: #f3f4f6;
        }
        .rich-text-editor.dark-mode .ql-toolbar .ql-fill {
          fill: #f3f4f6;
        }
        .rich-text-editor.dark-mode .ql-toolbar button:hover {
          background-color: #4b5563;
        }
        .rich-text-editor.dark-mode .ql-toolbar button.ql-active {
          background-color: #1f2937;
        }
        .rich-text-editor .ql-editor {
          min-height: 120px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;