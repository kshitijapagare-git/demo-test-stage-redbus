import BoardingPointList from '../components/BoardingPointList'
import Offers from '../components/Offers'
import SearchCard from '../components/SearchCard'
import { boardingPoints, cities } from '../data'

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-scene" aria-hidden="true">
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <div className="road" />
          <div className="hero-bus">🚌</div>
        </div>
        <div className="container">
          <h1>
            India's No. 1 online
            <br />
            bus ticket booking site
          </h1>
        </div>
      </section>
      <div className="container search-wrap">
        <SearchCard />
      </div>
      <main>
        <Offers />
        <section className="container section" aria-labelledby="boarding-points-heading">
          <div className="section-head">
            <h2 id="boarding-points-heading">Boarding Points</h2>
          </div>
          <BoardingPointList cities={cities} boardingPoints={boardingPoints} />
        </section>
      </main>
    </>
  )
}

export default HomePage
