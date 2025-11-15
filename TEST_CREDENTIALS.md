# Mi42 Test Credentials

## Test Users for Role-Based Access Control

### Admin User
- **Username:** `admin`
- **Password:** `Adm1n!`
- **Email:** admin@mi42.local
- **Role:** Admin
- **Access:** Full system access, user management, all features

### Internal User (B+L Employee)
- **Username:** `internal_user`
- **Password:** `Int3rn`
- **Email:** internal@bl.cx
- **Role:** Internal
- **Access:** Standard features, no user management

### External User (Customer)
- **Username:** `external_user`
- **Password:** `Ext3rn`
- **Email:** customer@example.com
- **Role:** External
- **Access:** Limited features, customer-facing only

## Testing Role-Based Access

1. Login at `/login` with different users
2. Verify that:
   - Only **Admin** can see "Users" link in sidebar
   - Only **Admin** can access `/users` page
   - **Internal** users have full agent access
   - **External** users may have restricted features (to be implemented)

## Security Notes

- All passwords use bcrypt hashing (cost factor 10)
- Session tokens expire after 7 days
- Passwords must be at least 6 characters
- Change these test passwords in production!
