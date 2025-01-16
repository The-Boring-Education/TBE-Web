import { ModalProps } from '@/interfaces';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

const Modal = ({ isOpen, closeModal, title, children }: ModalProps) => {
  return (
    <Dialog
      open={isOpen}
      as='div'
      className='relative z-10'
      onClose={closeModal}
    >
      <div className='fixed inset-0 bg-black bg-opacity-30' />
      <div className='fixed inset-0 z-10 flex items-center justify-center p-2'>
        <DialogPanel className='w-full max-w-lg rounded-lg bg-white shadow-lg p-2'>
          <div className='flex justify-between items-center mb-2'>
            <DialogTitle className='text-md font-semibold'>{title}</DialogTitle>
            <button onClick={closeModal} className='text-md'>
              ✖
            </button>
          </div>
          <div className='bg-gray-100 border'>{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default Modal;
