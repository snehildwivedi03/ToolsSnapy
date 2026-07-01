export interface ShareToolMeta {
  id: string;
  title: string;
  description: string;
  to: string;
  iconColor: string;
  iconBg: string;
}

export const SHARE_TOOLS: ShareToolMeta[] = [
  {
    id: "share-text",
    title: "Share Text",
    description: "Paste or type text and get a 6-character code to share instantly.",
    to: "/share/text",
    iconColor: "#0284c7",
    iconBg: "#e0f2fe",
  },
  {
    id: "share-files",
    title: "Share Files",
    description: "Upload files or an entire folder. Up to 500 MB, 100 files, 15-minute link.",
    to: "/share/files",
    iconColor: "#6f4e37",
    iconBg: "#faf6f1",
  },
  {
    id: "share-images",
    title: "Share Images",
    description: "Share up to 50 PNG / JPG / WEBP images. 10 MB per image, 250 MB total.",
    to: "/share/images",
    iconColor: "#059669",
    iconBg: "#ecfdf5",
  },
  {
    id: "share-pdfs",
    title: "Share PDFs",
    description: "Upload up to 25 PDFs. 25 MB per file, 250 MB total, 15-minute link.",
    to: "/share/pdfs",
    iconColor: "#dc2626",
    iconBg: "#fef2f2",
  },
  {
    id: "receive-content",
    title: "Receive Content",
    description: "Enter a share code to retrieve text, files or images and download them.",
    to: "/share/receive",
    iconColor: "#d97706",
    iconBg: "#fffbeb",
  },
];
