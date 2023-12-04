

const jsonError = (err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: 'JSON tidak valid' })
  } else {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  jsonError,
}
