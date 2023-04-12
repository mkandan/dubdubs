import axios from 'axios'

import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

const FormToServerless = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const data = Object.fromEntries(formData)
    axios.post('/.redwood/functions/testServerless', data).then((response) => {
      console.log(response.data)
    })
  }

  return (
    <form onSubmit={(event) => handleSubmit(event)}>
      <label htmlFor="yt_url">Youtube URL</label>
      <input type="text" name="yt_url" required />
      <select name="desired_language" defaultValue={'en'}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  )
}

const HomePage = () => {
  return (
    <>
      <MetaTags title="Home" description="Home page" />

      <h1>HomePage</h1>
      <p>
        Find me in <code>./web/src/pages/HomePage/HomePage.tsx</code>
      </p>
      {FormToServerless()}
      <p>
        My default route is named <code>home</code>, link to me with `
        <Link to={routes.home()}>Home</Link>`
      </p>
    </>
  )
}

export default HomePage