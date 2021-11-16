import express, { Request, Response } from 'express'
const router = express.Router()

router.get('/', (req: Request, res: Response) => {
  res.send('Get all data from user with a key')
})

router.get('/:id', (req: Request, res: Response) => {
  res.send(`Get data for ID ${req.params.id} with a key`)
})

router.post('/', (req: Request, res: Response) => {
  res.send(`Create a new shortened link`)
})

router.delete('/:id', (req: Request, res: Response) => {
  res.send(`Delete a ${req.params.id} link`)
})

export = router
