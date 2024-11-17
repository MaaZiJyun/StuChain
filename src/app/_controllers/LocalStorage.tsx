const LocalStorage = () => {
  // Function to set an item in localStorage
  const setAttribute = async (name: string, value: string) => {
    try {
      const newValue = JSON.stringify(value);
      localStorage.setItem(name, newValue);
      console.log(`Set ${name}: ${newValue} in localStorage`);
    } catch (error) {
      console.error(`Failed to set ${name} in localStorage:`, error);
    }
  };
  // Function to remove an item from localStorage
  const removeAttribute = async (name: string) => {
    try {
      localStorage.removeItem(name);
      console.log(`Removed ${name} from localStorage`);
    } catch (error) {
      console.error(`Failed to remove ${name} from localStorage:`, error);
    }
  };
  // Function to get an item from localStorage
  const getAttribute = (name: string) => {
    try {
      const value = localStorage.getItem(name);

      if (value === null) {
        console.log(`No value found for ${name} in localStorage.`);
        return null; // 没有找到对应的值时返回null
      }

      return JSON.parse(value); // 解析并返回JSON对象
    } catch (error) {
      console.error(`Failed to retrieve ${name} from localStorage:`, error);
      return null; // 若解析失败，则返回null
    }
  };
  return {
    setAttribute,
    getAttribute,
    removeAttribute,
  };
};
export default LocalStorage;
