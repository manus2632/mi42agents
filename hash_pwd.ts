import bcrypt from 'bcryptjs';

const passwords = {
  admin: 'Adm1n!',
  internal: 'Int3rn',
  external: 'Ext3rn'
};

for (const [user, pwd] of Object.entries(passwords)) {
  const hash = bcrypt.hashSync(pwd, 10);
  console.log(`${user}: ${hash}`);
}
