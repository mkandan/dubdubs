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

const handleBrain = () => {
  console.log('clicked brain at: ', new Date().toLocaleString())
  axios
    .post(
      'http://localhost:54321/functions/v1/brain',
      // 'https://tpqbderafyftvmrhrdht.functions.supabase.co/brain',
      {
        name: 'Functions',
      },
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`,
          // Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
          'Content-Type': 'application/json',
          // 'Access-Control-Allow-Origin': '*',
          // 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin',
        },
      }
    )
    .then((response) => {
      console.log(response.data)
    })
    .catch((error) => {
      console.error(error)
    })
}

const HomePage = () => {
  return (
    <>
      <MetaTags title="Home" description="Home page" />

      <h1>HomePage</h1>
      <p>
        Find me in <code>./web/src/pages/HomePage/HomePage.tsx</code>
      </p>
      {/* {FormToServerless()} */}
      <button onClick={() => handleBrain()}>
        Supabase edge function "brain"
      </button>
      <p>
        My default route is named <code>home</code>, link to me with `
        <Link to={routes.home()}>Home</Link>`
      </p>
    </>
  )
}

export default HomePage
