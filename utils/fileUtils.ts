export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // result is "data:mime/type;base64,the_base_64_string"
        // we only want "the_base_64_string"
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error("Failed to read file as string"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
