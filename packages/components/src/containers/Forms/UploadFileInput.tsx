import { Text } from "@tbe/components";
import type { UploadFileInputProps } from "@tbe/interface";

const UploadFileInput = ({
  label = "Upload File",
  file,
  onChange,
  accept = "*",
  className = "",
  placeholder = "📄 Click or drag your file here to upload",
  isProcessing = false,
}: UploadFileInputProps & { isProcessing?: boolean }) => (
  <label
    className={`border-2 border-dashed border-primary px-8 py-10 rounded-lg w-full max-w-xl text-center ${isProcessing ? "cursor-wait opacity-70" : "cursor-pointer hover:bg-primary/5"} bg-white transition-all ${className}`}
  >
    <input
      accept={accept === "pdf" ? ".pdf,application/pdf" : accept}
      className="hidden"
      type="file"
      onChange={onChange}
      disabled={isProcessing}
    />
    <Text className="paragraph text-gray-500" level="p">
      {isProcessing
        ? "⏳ Extracting skills from PDF..."
        : file
          ? `✅ ${label}: ${file.name}`
          : placeholder}
    </Text>
  </label>
);

export default UploadFileInput;
