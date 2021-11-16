import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  res.send('Get all data from user with a key')
})

router.get('/:id', (req, res) => {
  res.send(`Get data for ID ${req.params.id} with a key`)
})

router.post('/', (req, res) => {
  res.send(`Create a new shortened link`)
})

router.delete('/:id', (req, res) => {
  res.send(`Delete a ${req.params.id} link`)
})

const routes = router
export default routes
