export function About() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="label" data-reveal>About the showroom</p>
      <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl" data-reveal>
        A website that behaves like a dealership floor
      </h1>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-detail">
        <p data-reveal>
          Most car websites are lists: a grid of thumbnails, a price, a button that goes somewhere
          else. This one is a room. You walk in, the lights are low, the floor reflects, and six cars
          sit on their own platforms. Turn one. Open its door. Sit inside. Only then decide.
        </p>
        <p data-reveal>
          Everything is rendered live in your browser. The car you are looking at is real geometry
          under a studio light rig, not a photograph, so the paint changes as you click and the
          camera can go wherever the interior view needs it to.
        </p>
      </div>

      <h2 className="mt-14 font-display text-2xl" data-reveal>What we hold to</h2>
      <ul className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-glass border border-ink/10 bg-ink/10 sm:grid-cols-2">
        {[
          {
            t: 'Numbers we can defend',
            d: 'Every price and figure carries a source and a last-verified date. If we cannot check it, we do not publish it.',
          },
          {
            t: 'Fast on a phone',
            d: 'The 3D quality steps down on weaker devices, and if a device cannot run WebGL the site still tells you the whole story with static imagery.',
          },
          {
            t: 'Your data, minimally held',
            d: 'Name, phone, email, the car you are interested in. An explicit consent checkbox, a stated retention period and a deletion route.',
          },
          {
            t: 'Honest about the models',
            d: 'The 3D geometry in this build is a stylised placeholder. Licensed production models replace it before launch, and the site says so.',
          },
        ].map((item) => (
          <li key={item.t} data-reveal className="bg-bg p-6">
            <h3 className="font-display text-xl">{item.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-detail">{item.d}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 font-display text-2xl" data-reveal>Where to find us</h2>
      <div className="glass mt-6 flex flex-col gap-2 p-6 text-sm text-detail" data-reveal>
        <p>Level 1, Signature Hall, Auto District, Bengaluru 560001, India</p>
        <p>Open Monday to Saturday, 10:00 – 19:30. Test drives by appointment.</p>
        <p>
          <a className="hover:text-ink" href="mailto:drive@luxe-showroom.example">drive@luxe-showroom.example</a>
        </p>
      </div>
    </section>
  )
}
