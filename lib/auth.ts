export interface User {
  id: string
  email: string
  fullName: string
  createdAt: string
}

const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@kaching.app',
  fullName: 'Demo User',
  createdAt: new Date().toISOString(),
};

export const authService = {
  login: (email: string, password: string): User | null => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('kaching_current_user', JSON.stringify(DEMO_USER));
      return DEMO_USER;
    }
    
    const users = JSON.parse(localStorage.getItem("kaching_users") || "[]")
    const user = users.find((u: any) => u.email === email && u.password === password)

    if (user) {
      const { password: _, ...userWithoutPassword } = user
      localStorage.setItem("kaching_current_user", JSON.stringify(userWithoutPassword))
      return userWithoutPassword
    }
    return null
  },

  signup: (email: string, password: string, fullName: string): User => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('kaching_current_user', JSON.stringify(DEMO_USER));
      return DEMO_USER;
    }
    
    const users = JSON.parse(localStorage.getItem("kaching_users") || "[]")
    if (users.find((u: any) => u.email === email)) {
      throw new Error("User already exists")
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      fullName,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("kaching_users", JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    localStorage.setItem("kaching_current_user", JSON.stringify(userWithoutPassword))
    return userWithoutPassword
  },

  getCurrentUser: (): User | null => {
    if (process.env.NODE_ENV === 'development') {
      return DEMO_USER;
    }
    const user = localStorage.getItem("kaching_current_user")
    return user ? JSON.parse(user) : null
  },

  logout: () => {
    localStorage.removeItem("kaching_current_user")
  },

  isAuthenticated: (): boolean => {
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return !!localStorage.getItem("kaching_current_user")
  },
}
