import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import type { ModalProps } from '@tbe/interface';

const Modal = ({ isOpen, closeModal, title, children }: ModalProps) => (
  <Dialog as='div' className='relative z-10' open={isOpen} onClose={closeModal}>
    <div className='fixed inset-0 bg-black bg-opacity-30' />
    <div className='fixed inset-0 z-10 flex items-center justify-center p-2'>
      <DialogPanel className='w-full max-w-lg rounded-lg bg-white shadow-lg p-2'>
        <div className='flex justify-between items-center mb-2'>
          <DialogTitle className='text-md font-semibold'>{title}</DialogTitle>
          <button className='text-md' onClick={closeModal}>
            ✖
          </button>
        </div>
        <div className='bg-gray-100 border'>{children}</div>
      </DialogPanel>
    </div>
  </Dialog>
);

export default Modal;
