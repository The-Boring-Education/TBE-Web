import { useEffect } from 'react';
import { FlexContainer, InputFieldContainer, Text } from '@/components';
import { useUsername } from '@/hooks';
import { StepUsernameProps } from '@/interfaces';

const StepUsername = ({
  userName,
  onChange,
  setIsAvailable,
}: StepUsernameProps) => {
  const { message, isUsernameAvailable } = useUsername(userName);

  useEffect(() => {
    setIsAvailable?.(isUsernameAvailable);
  }, [isUsernameAvailable]);

  return (
    <FlexContainer className='gap-2'>
      <Text level='p' className='paragraph'>
        1. Choose Your Username
      </Text>
      <InputFieldContainer
        label='Username'
        type='text'
        value={userName}
        onChange={onChange}
        className='w-full'
      />
      <Text level='span' className='pre-title'>
        {message}
      </Text>
    </FlexContainer>
  );
};

export default StepUsername;
