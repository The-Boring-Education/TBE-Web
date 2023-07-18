interface ScreenReaderProps {
  text: string;
}

const ScreenReader = ({ text }: ScreenReaderProps) => {
  return <span className='sr-only'>{text}</span>;
};

export default ScreenReader;
