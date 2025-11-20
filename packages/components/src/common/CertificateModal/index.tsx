import React, { useState, useEffect } from 'react';

import { Button, FlexContainer, InputField, Text } from '@tbe/components';
import Modal from '../Modal';
import { CertificateModalProps } from '@tbe/interface';

const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  closeModal,
  userName,
  userEmail,
  onGenerateCertificate,
  errorMessage,
}) => {
  const [certificateName, setCertificateName] = useState(userName);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset certificate name when modal opens
  useEffect(() => {
    if (isOpen) {
      setCertificateName(userName);
    }
  }, [isOpen, userName]);

  const handleGenerate = async () => {
    if (!certificateName.trim()) {
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerateCertificate(certificateName);
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} title='Edit Certificate Name'>
      <div className='p-4 md:p-6 gradient-8 rounded-lg'>
        <Text level='p' className='paragraph mb-6'>
          You can edit your name as it will appear on the certificate. Your email will remain the
          same.
        </Text>

        <FlexContainer className='gap-4 py-2 px-2 md:px-0' direction='col' fullWidth>
          <InputField
            label='Name on Certificate'
            field='certificateName'
            value={certificateName}
            onChange={(field, value) => setCertificateName(value)}
            placeholder='Enter your preferred name'
            className='bg-white border-greyLight text-contentLight rounded-md'
            required
          />

          <FlexContainer className='gap-2' direction='col' itemCenter={false}>
            <Text className='pre-title' level='label'>
              Email
            </Text>
            <Text className='w-full strong-text' level='p'>
              {userEmail}
            </Text>
          </FlexContainer>

          {errorMessage && (
            <div className='rounded-md p-3'>
              <Text level='p' className='paragraph text-primary'>
                {errorMessage}
              </Text>
            </div>
          )}
        </FlexContainer>

        <FlexContainer
          className='flex-col sm:flex-row gap-3 sm:gap-3 sm:justify-center mt-6 pt-4 border-t border-greyLight'
          direction='row'
        >
          <Button
            text='Cancel'
            variant='SECONDARY'
            onClick={closeModal}
            className='w-full sm:w-auto rounded-md'
          />
          <Button
            text={isGenerating ? 'Generating...' : 'Generate Certificate'}
            variant='SUCCESS'
            onClick={handleGenerate}
            disabled={!certificateName.trim() || isGenerating}
            className='w-full sm:w-auto rounded-md'
          />
        </FlexContainer>
      </div>
    </Modal>
  );
};

export default CertificateModal;
