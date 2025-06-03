import { Text } from '@/components';
import { UploadFileInputProps } from '@/interfaces';

const UploadFileInput = ({
  label = 'Upload File',
  file,
  onChange,
  accept = '*',
  className = '',
  placeholder = '📄 Click or drag your file here to upload',
}: UploadFileInputProps) => {
  return (
    <label
      className={`border-2 border-dashed border-primary px-8 py-10 rounded-lg w-full max-w-xl text-center cursor-pointer bg-white hover:bg-primary/5 transition-all ${className}`}
    >
      <input
        type='file'
        accept={accept}
        className='hidden'
        onChange={onChange}
      />
      <Text level='p' className='paragraph text-gray-500'>
        {file ? `✅ ${label}: ${file.name}` : placeholder}
      </Text>
    </label>
  );
};

export default UploadFileInput;
