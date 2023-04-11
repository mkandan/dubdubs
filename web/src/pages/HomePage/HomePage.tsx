import axios from 'axios'

import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

const ServerlessButton = () => {
  return (
    <button
      onClick={() => {
        axios.post('/.redwood/functions/testServerless').then((response) => {
          console.log(response.data)
        })
      }}
    >
      Test me!
    </button>
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
      {ServerlessButton()}
      <p>
        My default route is named <code>home</code>, link to me with `
        <Link to={routes.home()}>Home</Link>`
      </p>
    </>
  )
}

export default HomePage
