const API_URL = 'https://jsonplaceholder.typicode.com/users';

export const fetchUsers = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error('Не удалось загрузить данные. API недоступно.');
  }
  return res.json();
};
