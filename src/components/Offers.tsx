import { useEffect, useRef, useState } from 'react'
import { offers as defaultOffers } from '../data'
import { classNames } from '../lib/classNames'
import type { Offer, OfferTone } from '../types'

const OFFER_TABS = ['All', 'Bus', 'Train'] as const
type OfferTab = (typeof OFFER_TABS)[number]

const TONE_CLASS: Record<OfferTone, string> = {
  peach: 'offer-peach',
  pink: 'offer-pink',
  yellow: 'offer-yellow',
}

const CATEGORY_LABEL: Record<Offer['category'], string> = {
  bus: 'Bus',
  train: 'Train',
}

const TAB_CATEGORY: Record<'Bus' | 'Train', Offer['category']> = {
  Bus: 'bus',
  Train: 'train',
}

const COPY_FEEDBACK_MS = 2000
const COPY_ERROR_MESSAGE = "Couldn't copy — please copy the code manually"

type CopyStatus = 'idle' | 'copied' | 'error'

interface OfferCardProps {
  offer: Offer
}

function OfferCard({ offer }: OfferCardProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const resetTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  async function handleCopy() {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }

    try {
      await navigator.clipboard.writeText(offer.code)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }

    resetTimerRef.current = window.setTimeout(() => {
      setCopyStatus('idle')
      resetTimerRef.current = null
    }, COPY_FEEDBACK_MS)
  }

  const chipContent =
    copyStatus === 'copied'
      ? 'Copied!'
      : copyStatus === 'error'
        ? COPY_ERROR_MESSAGE
        : offer.code

  return (
    <article className={classNames('offer', TONE_CLASS[offer.tone])}>
      <span className="badge">{CATEGORY_LABEL[offer.category]}</span>
      <h3>{offer.title}</h3>
      <p>Valid till {offer.valid}</p>
      <button type="button" className="code" onClick={handleCopy}>
        <span aria-hidden="true">🏷</span> {chipContent}
      </button>
      <span className="offer-art" aria-hidden="true">
        🚌
      </span>
    </article>
  )
}

interface OffersProps {
  offers?: Offer[]
}

function Offers({ offers = defaultOffers }: OffersProps) {
  const [activeTab, setActiveTab] = useState<OfferTab>('All')

  const visibleOffers =
    activeTab === 'All'
      ? offers
      : offers.filter((offer) => offer.category === TAB_CATEGORY[activeTab])

  return (
    <section className="container section" aria-labelledby="offers-heading">
      <div className="section-head">
        <h2 id="offers-heading">Offers for you</h2>
        <a href="#">View more</a>
      </div>
      <div className="tabs" role="tablist" aria-label="Offer categories">
        {OFFER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={tab === activeTab}
            className={classNames('tab', tab === activeTab && 'active')}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {visibleOffers.length > 0 ? (
        <div className="offer-grid">
          {visibleOffers.map((offer) => (
            <OfferCard key={offer.code} offer={offer} />
          ))}
        </div>
      ) : (
        <p className="offers-empty">No offers right now</p>
      )}
    </section>
  )
}

export default Offers
