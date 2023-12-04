const sql = require('../lib/postgres.js')

const User = {}

User.findAll = async function(page = 1) {
  return await sql`SELECT id,email,gender,role FROM users LIMIT 10 OFFSET ${(page - 1) * 10}`
}

User.findByEmail = async function(email) {
  const [user] = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`
  return user
}

User.findById = async function(id) {
  const [user] = await sql`SELECT id,email,gender,role FROM users WHERE id = ${id} LIMIT 1`
  return user
}

User.insert = async function(userData) {
  userData.id = sql`(select id from users order by id desc limit 1) + 1`
  const [user] = await sql`
  INSERT INTO users ${
    sql(userData,['id','email','gender','password','role'])
  }
  RETURNING id
  `
  return user.id
}

User.update = async function(userData) {
  const vals = Object.keys(userData)
  await sql`
  UPDATE users set ${
    sql(userData,vals)
  }
  WHERE id = ${userData.id}
  `
}

User.delete = async function(id) {
  await sql`DELETE FROM users WHERE id = ${id}`
}

User.validateUserData = function(userData) {
  if (userData &&
      userData.email &&
      userData.password &&
      userData.gender &&
      userData.role
  ) {
    return userData
  }
  return false
}

User.partialValidateUserData = function(userData) {
  if (userData &&
      userData.email ||
      userData.password ||
      userData.gender ||
      userData.role
  ) {
    return userData
  }
  return false
}

User.validateLoginData = function(loginData) {
  if (loginData && loginData.email && loginData.password) {
    return loginData
  }
  return false
}

module.exports = User
