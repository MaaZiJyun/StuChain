import React, { useState, useEffect } from 'react';

const RealTimeClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // 定义一个函数，用于获取当前时间并格式化
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      // 格式化时间为 YYYY-MM-DD HH:mm:ss
      setCurrentTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    };

    // 初始化时立即更新一次时间
    updateTime();

    // 每秒更新一次时间
    const intervalId = setInterval(updateTime, 1000);

    // 清除定时器，防止内存泄漏
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <p>{currentTime}</p>
    </div>
  );
};

export default RealTimeClock;
