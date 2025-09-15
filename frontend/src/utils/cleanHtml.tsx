import DOMPurify from "dompurify";

interface CleanHtmlProps{
    html: string
}

export const CleanHtml = ({ html }: CleanHtmlProps) => {
      const cleanHtml = DOMPurify.sanitize(html);

    return (
        <span dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    )
}
