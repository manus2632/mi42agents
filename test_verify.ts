import bcrypt from 'bcryptjs';

const hash = '$2b$10$REBZovr9P9tJCZjSgWz0NejPwYmDQi/O9aIbr5H8iw1V4u9FcybGS';
const password = 'Adm1n!';

bcrypt.compare(password, hash).then(result => {
  console.log('Password verification result:', result);
}).catch(err => {
  console.error('Error:', err);
});
