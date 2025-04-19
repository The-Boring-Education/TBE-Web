import { useEffect } from 'react';
import { FlexContainer, InputFieldContainer, Text } from '@/components';
import { useUsername } from '@/hooks';
import { StepUsernameProps } from '@/interfaces';

const StepUsername = ({
  userName,
  onChange,
  setIsUsernameAvailable,
}: StepUsernameProps) => {
  const { message, isUsernameAvailable } = useUsername(userName);

  useEffect(() => {
    setIsUsernameAvailable(isUsernameAvailable);
  }, [isUsernameAvailable]);

  return (
    <FlexContainer className='gap-2 md:w-1/2 w-full m-auto' direction='col'>
      <Text level='p' className='paragraph'>
        1. Choose Your Username
      </Text>
      <InputFieldContainer
        label='Username'
        type='text'
        value={userName}
        onChange={onChange}
        className=''
      />
      <Text
        level='span'
        className={`span ${
          isUsernameAvailable ? 'text-success' : 'text-primary'
        }`}
      >
        {message}
      </Text>
    </FlexContainer>
  );
};

export default StepUsername;
