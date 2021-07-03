import React from 'react';

interface IProps {
  show: boolean;
  onCloseModal: () => void;
  children: React.ReactNode;
}

/**
 * ? 레이아웃으로 옮겨도 될듯
 * 모달 컴포넌트
 * @param param0
 * @returns
 */
export default function Modal({ children, onCloseModal, show }: IProps) {
  return <div>{children}</div>;
}
