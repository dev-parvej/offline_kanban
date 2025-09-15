import React, { useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { uploadImage, validateImageFile } from '../../api/fileService';

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
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        // Validate file before upload
        const validationError = validateImageFile(file);
        if (validationError) {
          alert(validationError);
          return;
        }

        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection();
          const index = range ? range.index : quill.getLength();
          
          // Show loading placeholder (simple gray rectangle)
          const loadingPlaceholder = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="100" fill="#e5e7eb"/>
              <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="12">
                Uploading...
              </text>
            </svg>
          `);
          quill.insertEmbed(index, 'image', loadingPlaceholder, 'user');
          quill.setSelection(index + 1 as any);
          
          try {
            // Upload image to server
            const response = await uploadImage(file);
            
            // Replace placeholder with actual image URL
            quill.deleteText(index, 1);
            quill.insertEmbed(index, 'image', response.url, 'user');
            quill.setSelection(index + 1 as any);
          } catch (error) {
            console.error('Failed to upload image:', error);
            // Remove placeholder on error
            quill.deleteText(index, 1);
            alert('Failed to upload image. Please try again.');
          }
        }
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
      <style>{`
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