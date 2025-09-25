import { useEffect } from 'react';

import { FlexContainer, InputFieldContainer, Text } from '@tbe/components';
import { useUsername } from '@tbe/hooks';
import type { StepUsernameProps } from '@tbe/interface';

const StepUsername = ({
  userName,
  onChange,
  setIsUsernameAvailable,
}: StepUsernameProps) => {
  const { message, isUsernameAvailable } = useUsername(userName);

  useEffect(() => {
    setIsUsernameAvailable(isUsernameAvailable);
  }, [isUsernameAvailable, setIsUsernameAvailable]);

  return (
    <FlexContainer className='gap-2 md:w-1/2 w-full m-auto' direction='col'>
      <Text className='paragraph' level='p'>
        1. Choose Your Username
      </Text>
      <InputFieldContainer
        className=''
        label='Username'
        type='text'
        value={userName}
        onChange={onChange}
      />
      <Text
        className={`span ${
          isUsernameAvailable ? 'text-success' : 'text-primary'
        }`}
        level='span'
      >
        {message}
      </Text>
    </FlexContainer>
  );
};

export default StepUsername;
