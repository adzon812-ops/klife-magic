'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Preloader from '@/components/ui/Preloader'
import { AudioControl, playWhoosh, playChime } from '@/components/ui/AudioManager'
import { PRODUCTS } from '@/lib/products'

// Dynamic imports (Three.js needs to run client-side)
const SkyScene = dynamic(() => import('@/components/three/SkyScene'), {
  ssr: false,
  loading: () => null,
})
const ProductCanvas = dynamic(() => import('@/components/three/ProductCanvas'), {
  ssr: false,
  loading: () => null,
})

// ============================================================
// CUSTOM CURSOR
// ============================================================
function CustomCursor() {
  const cursorRef = useRef(null)
  const followerRef = useRef(null)
  const posRef = useRef({ x: 0, y: 0 })
  const followerPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const move = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`
      }
    }
    window.addEventListener('mousemove', move)

    let raf
    const followAnim = () => {
      followerPos.current.x += (posRef.current.x - followerPos.current.x) * 0.1
      followerPos.current.y += (posRef.current.y - followerPos.current.y) * 0.1
      if (followerRef.current) {
        followerRef.current.style.transform = `translate(${followerPos.current.x - 20}px, ${followerPos.current.y - 20}px)`
      }
      raf = requestAnimationFrame(followAnim)
    }
    followAnim()

    const addHover = (e) => {
      if (e.target.matches('button, a, [data-hover]')) {
        cursorRef.current?.classList.add('hovering')
      }
    }
    const removeHover = () => cursorRef.current?.classList.remove('hovering')
    document.addEventListener('mouseover', addHover)
    document.addEventListener('mouseout', removeHover)

    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', addHover)
      document.removeEventListener('mouseout', removeHover)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={cursorRef} className="cursor" style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }} />
      <div ref={followerRef} className="cursor-follower" style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9998 }} />
    </>
  )
}

// ============================================================
// PARTICLE BURST (click effect)
// ============================================================
function spawnParticles(x, y, color = '#a8e6cf') {
  const count = 16
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.className = 'particle'
    const angle = (i / count) * Math.PI * 2
    const dist = 40 + Math.random() * 80
    el.style.cssText = `
      left: ${x}px; top: ${y}px;
      background: ${color};
      --tx: ${Math.cos(angle) * dist}px;
      --ty: ${Math.sin(angle) * dist}px;
    `
    document.body.appendChild(el)
    el.addEventListener('animationend', () => el.remove())
  }
}

// ============================================================
// NAVIGATION
// ============================================================
function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a href="#" className="nav-logo">K<span>—</span>LIFE</a>
      <ul className="nav-links">
        {['Products', 'Benefits', 'Science', 'Story'].map((item) => (
          <li key={item}>
            <a href={`#${item.toLowerCase()}`}>{item}</a>
          </li>
        ))}
      </ul>
      <button
        className="nav-cta"
        onClick={(e) => {
          playChime()
          spawnParticles(e.clientX, e.clientY)
        }}
      >
        Buy Now
      </button>
    </nav>
  )
}

// ============================================================
// HERO SECTION
// ============================================================
function HeroSection() {
  const handleCTA = (e) => {
    playChime()
    spawnParticles(e.clientX, e.clientY, '#a8e6cf')
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="hero">
      <motion.div
        className="hero-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          Born in Korea
        </motion.div>

        <h1 className="hero-title">
          <span className="line">
            <motion.span
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ delay: 1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              The Pure
            </motion.span>
          </span>
          <span className="line">
            <motion.span
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ delay: 1.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontStyle: 'italic', color: '#a8e6cf' }}
            >
              Magic
            </motion.span>
          </span>
          <span className="line">
            <motion.span
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ delay: 1.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              of Care
            </motion.span>
          </span>
        </h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          Perfect for your hands · Powered by nature
        </motion.p>

        <motion.button
          className="hero-cta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1, duration: 0.8 }}
          onClick={handleCTA}
          onMouseEnter={() => playWhoosh()}
        >
          Unlock The Magic
          <span className="hero-cta-icon" />
        </motion.button>
      </motion.div>

      <div className="hero-scroll">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}

// ============================================================
// HOLOGRAPHIC POPUP
// ============================================================
function HoloPopup({ product, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="holo-popup"
          style={{ bottom: '110%', left: '50%', transform: 'translateX(-50%)' }}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.97 }}
          transition={{ duration: 0.25 }}
        >
          <div className="holo-popup-title">{product.fullName}</div>
          {Object.entries(product.stats).map(([key, val]) => (
            <div key={key} className="holo-stat">
              <span className="holo-stat-label">{key}</span>
              <span className="holo-stat-value">{val}</span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// PRODUCT CARD
// ============================================================
function ProductCard({ product, index }) {
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })

  const handleClick = useCallback((e) => {
    playChime()
    spawnParticles(e.clientX, e.clientY, product.accentColor)
    setActive((v) => !v)
  }, [product.accentColor])

  return (
    <motion.div
      ref={ref}
      className={`product-card ${product.id}`}
      onClick={handleClick}
      onMouseEnter={() => { setHovered(true); playWhoosh() }}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      data-hover
      style={{ position: 'relative' }}
    >
      {/* Badge */}
      {product.badge && (
        <div style={{
          position: 'absolute', top: 16, right: 16, zIndex: 3,
          fontFamily: 'var(--font-ui)', fontSize: '0.58rem',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          padding: '4px 10px', background: product.accentColor,
          color: '#1a3a5c', fontWeight: 600
        }}>
          {product.badge}
        </div>
      )}

      {/* 3D Canvas */}
      <div className="product-canvas-area" style={{ position: 'relative' }}>
        <ProductCanvas
          productId={product.id}
          isHovered={hovered}
          isActive={active}
        />
        <HoloPopup product={product} visible={active} />
      </div>

      <div className="product-num">{product.num}</div>
      <h3 className="product-name" style={{ color: product.accentColor }}>
        {product.name}
      </h3>
      <p className="product-tagline">{product.tagline}</p>
      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 20 }}>
        {product.description}
      </p>

      <div className="product-tags">
        {product.tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>

      <div className="product-cta-row">
        <div>
          <div className="product-price-label">Цена</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginTop: 2 }}>
            {product.price}
          </div>
        </div>
        <button className="product-buy-btn" onClick={(e) => e.stopPropagation()}>
          Купить
        </button>
      </div>

      {/* Click hint */}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-ui)', fontSize: '0.55rem',
        letterSpacing: '0.25em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.2)',
        transition: 'color 0.3s',
      }}>
        {active ? 'Нажмите ещё раз ↑' : 'Нажмите для деталей'}
      </div>
    </motion.div>
  )
}

// ============================================================
// PRODUCTS SECTION
// ============================================================
function ProductsSection() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section className="section" id="products" style={{ paddingTop: 160, paddingBottom: 160 }}>
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ maxWidth: 600, marginBottom: 80 }}
        >
          <div className="section-label">Линейка продуктов</div>
          <h2 className="section-title">
            Три <em>волшебных</em> формулы для вашего дома
          </h2>
          <p className="section-body">
            Каждый продукт создан с любовью в Корее. Нажмите на любой флакон,
            чтобы узнать магический состав.
          </p>
        </motion.div>

        <div className="products-grid">
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// BENEFITS SECTION
// ============================================================
const BENEFITS = [
  {
    icon: '🌿',
    title: 'Бережно для рук',
    body: 'pH-нейтральные формулы с провитамином B5 и алоэ защищают и увлажняют кожу рук при каждом использовании.',
  },
  {
    icon: '⚡',
    title: '3x Концентрат',
    body: 'Одного флакона хватает в три раза дольше обычного средства. Меньше упаковки — меньше вреда природе.',
  },
  {
    icon: '🌱',
    title: '100% Веган & Эко',
    body: 'Состав из органических ингредиентов. Без парабенов, фосфатов и токсичных добавок. Сертифицировано.',
  },
]

function BenefitsSection() {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })

  return (
    <section className="section benefits-section" id="benefits">
      <div className="container">
        <div className="benefits-grid">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1 }}
          >
            <div className="section-label">Почему K-LIFE</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Чистота, которая заботится
              <br />
              о <em>вас</em>
            </h2>
            <p className="section-body" style={{ marginBottom: 48 }}>
              Мы создаём средства, которые не просто очищают — они ухаживают
              за вашими руками и вашей планетой.
            </p>

            {/* Economy visual */}
            <div style={{
              background: 'rgba(168,230,207,0.06)',
              border: '1px solid rgba(168,230,207,0.2)',
              padding: 24, marginTop: 32
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: '#a8e6cf', lineHeight: 1 }}>
                3x
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                Экономичнее обычных средств
              </div>
            </div>
          </motion.div>

          <div ref={ref} className="benefit-items">
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                className={`benefit-item ${inView ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div className="benefit-icon">{b.icon}</div>
                <div>
                  <div className="benefit-title">{b.title}</div>
                  <div className="benefit-body">{b.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// SCIENCE SECTION
// ============================================================
const INGREDIENTS = [
  { emoji: '🌱', name: 'Алоэ Вера' },
  { emoji: '🌸', name: 'Сакура' },
  { emoji: '🌿', name: 'Провитамин B5' },
  { emoji: '🌊', name: 'Морская соль' },
  { emoji: '🍃', name: 'Мята' },
]

function ScienceSection() {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })

  return (
    <section className="section science-section" id="science">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          ref={ref}
        >
          <div className="section-label">Состав</div>
          <h2 className="section-title" style={{ maxWidth: 700, margin: '0 auto 16px' }}>
            Наука заботы о <em>руках</em>
          </h2>
          <p className="section-body" style={{ maxWidth: 500, margin: '0 auto 60px' }}>
            Мы ухаживаем за вашими руками так же бережно, как за вашей посудой.
          </p>
        </motion.div>

        {/* Animated ingredient orbs */}
        <div className="ingredients-row">
          {INGREDIENTS.map((ing, i) => (
            <div
              key={i}
              className={`ingredient ${inView ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <div className="ingredient-orb">{ing.emoji}</div>
              <div className="ingredient-name">{ing.name}</div>
            </div>
          ))}
        </div>

        {/* Molecule visual (CSS) */}
        <div style={{
          marginTop: 80, textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.02em',
        }}>
          "Чистота без жертв. Для рук и природы."
        </div>
      </div>
    </section>
  )
}

// ============================================================
// FINAL CTA
// ============================================================
function FinalCTA() {
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true })

  return (
    <section className="final-cta-section" id="story">
      <div className="final-cta-content" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-label" style={{ textAlign: 'center', justifyContent: 'center', display: 'flex' }}>
            Начните сегодня
          </div>
          <h2 className="final-cta-title">
            Собери свой
            <br />
            <em>Magic Box</em>
          </h2>
          <p className="final-cta-body">
            Полный набор K-LIFE — всё для чистоты вашего дома. Бережно,
            экономично и с любовью из Кореи.
          </p>
          <button
            className="btn-primary"
            onClick={(e) => {
              playChime()
              spawnParticles(e.clientX, e.clientY, '#a8e6cf')
            }}
          >
            Build Your Magic Box
          </button>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-brand-name">K<span>—</span>LIFE</div>
          <p className="footer-brand-desc">
            Korean home care, born from pure nature. We believe that a clean
            home starts with gentle, effective, and responsible products.
          </p>
        </div>
        <div>
          <div className="footer-col-title">Products</div>
          <ul className="footer-links">
            <li><a href="#">K-BUBBLE</a></li>
            <li><a href="#">K-FRESH</a></li>
            <li><a href="#">K-CLEASTAR</a></li>
            <li><a href="#">Magic Box Bundle</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Company</div>
          <ul className="footer-links">
            <li><a href="#">Our Story</a></li>
            <li><a href="#">Ingredients</a></li>
            <li><a href="#">Sustainability</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Legal</div>
          <ul className="footer-links">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Use</a></li>
            <li><a href="#">Shipping</a></li>
            <li><a href="#">Returns</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">© 2025 K-LIFE. All rights reserved.</div>
        <div className="social-links">
          <a href="#">Instagram</a>
          <a href="#">TikTok</a>
          <a href="#">Telegram</a>
          <a href="#">WhatsApp</a>
        </div>
      </div>
    </footer>
  )
}

// ============================================================
// SCROLL PROGRESS BAR
// ============================================================
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX, transformOrigin: 'left' }}
    />
  )
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function Page() {
  const [loaded, setLoaded] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      setScrollProgress(Math.min(window.scrollY / max, 1))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Preloader */}
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}

      {/* Custom cursor */}
      <CustomCursor />

      {/* Scroll progress */}
      <ScrollProgress />

      {/* Audio */}
      <AudioControl />

      {/* Fixed 3D sky background */}
      <div className="canvas-container">
        <SkyScene scrollProgress={scrollProgress} />
      </div>

      {/* Gradient overlay for readability */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(26,58,92,0.3) 0%, rgba(26,58,92,0.5) 50%, rgba(15,30,50,0.7) 100%)'
      }} />

      {/* Navigation */}
      <Nav />

      {/* Page content */}
      <main className="page-wrapper">
        <HeroSection />
        <ProductsSection />
        <BenefitsSection />
        <ScienceSection />
        <FinalCTA />
        <Footer />
      </main>
    </>
  )
}
