import React, { useCallback } from 'react';

import { Backdrop, CloseModalButton } from './style';

interface IProps {
  show: boolean;
  onCloseModal: () => void;
  children: React.ReactNode;
}

/**
 * 모달 컴포넌트
 * @param onCloseModal
 * @param show
 * @returns Modal Component
 */
export default function Modal({ children, onCloseModal, show }: IProps) {
  const stopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  if (!show) return null;

  return (
    <Backdrop onClick={onCloseModal}>
      <div role="presentation" onClick={stopPropagation}>
        <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
        {children}
      </div>
    </Backdrop>
  );
}
