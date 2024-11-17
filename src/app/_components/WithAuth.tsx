"use client"

import { useRouter } from 'next/navigation';
import { ComponentType, useEffect } from 'react';
import LocalStorage from '../_controllers/LocalStorage';

// 定义高阶组件的类型
const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();

    useEffect(() => {
    //   const wallet = localStorage.getItem('wallet');
      const wallet = LocalStorage().getAttribute('wallet');
      if (!wallet) {
        router.push('/login'); // 用户未登录时跳转到登录页
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default withAuth;

