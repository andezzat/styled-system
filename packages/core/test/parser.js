import { system, compose } from '../src'

const theme = {
  colors: {
    primary: 'rebeccapurple',
    secondary: 'papayawhip',
  },
  fontSize: [0, 4, 8, 16],
}

const parser = system({
  color: {
    property: 'color',
    scale: 'colors',
  },
  fontSize: true,
})

test('uses default breakpoints', () => {
  const styles = parser({
    theme,
    fontSize: [1, 2, 3],
    color: ['primary', null, 'secondary'],
  })
  expect(styles).toEqual({
    color: 'rebeccapurple',
    fontSize: 4,
    '@media screen and (min-width: 40em)': {
      fontSize: 8,
    },
    '@media screen and (min-width: 52em)': {
      fontSize: 16,
      color: 'papayawhip',
    },
  })
})

// Per default, we expect it to be impossible to override breakpoints
test('does *not* use dynamically changed breakpoints', () => {
  const styles = parser({
    theme: { ...theme, breakpoints: ['11em', '22em', '33em'] },
    fontSize: [1, 2, 3],
    color: ['primary', null, 'secondary'],
  })
  expect(styles).toEqual({
    color: 'rebeccapurple',
    fontSize: 4,
    '@media screen and (min-width: 40em)': {
      fontSize: 8,
    },
    '@media screen and (min-width: 52em)': {
      fontSize: 16,
      color: 'papayawhip',
    },
  })
})

// With caching disabled, we expect it to be possible to change breakpoints
test('uses dynamically changed breakpoints', () => {
  const firstStyles = parser({
    theme: {
      ...theme,
      breakpoints: ['11em', '22em', '33em'],
      disableStyledSystemCache: true,
    },
    fontSize: [1, 2, 3],
    color: ['primary', null, 'secondary'],
  })
  expect(firstStyles).toEqual({
    color: 'rebeccapurple',
    fontSize: 4,
    '@media screen and (min-width: 11em)': {
      fontSize: 8,
    },
    '@media screen and (min-width: 22em)': {
      fontSize: 16,
      color: 'papayawhip',
    },
  })

  const secondStyles = parser({
    theme: {
      ...theme,
      breakpoints: ['9em', '8em', '7em'],
      disableStyledSystemCache: true,
    },
    fontSize: [1, 2, 3],
    color: ['primary', null, 'secondary'],
  })
  expect(secondStyles).toEqual({
    color: 'rebeccapurple',
    fontSize: 4,
    '@media screen and (min-width: 9em)': {
      fontSize: 8,
    },
    '@media screen and (min-width: 8em)': {
      fontSize: 16,
      color: 'papayawhip',
    },
  })

  const thirdStyles = parser({
    theme,
    fontSize: [1, 2, 3],
    color: ['primary', null, 'secondary'],
  })
  expect(thirdStyles).toEqual({
    color: 'rebeccapurple',
    fontSize: 4,
    '@media screen and (min-width: 9em)': {
      fontSize: 8,
    },
    '@media screen and (min-width: 8em)': {
      fontSize: 16,
      color: 'papayawhip',
    },
  })
})

test('sorts breakpoint mediaQueries correctly', () => {
  const breakpoints = ['480px', '768px', '1024px']
  breakpoints.sm = breakpoints[0]
  breakpoints.md = breakpoints[1]
  breakpoints.lg = breakpoints[2]

  expect(
    JSON.stringify(parser({
      theme: {
        ...theme,
        breakpoints,
        // disableStyledSystemCache: true,
      },
      fontSize: { _: 1, sm: 2, lg: 4 },
      color: { _: 'primary', md: 'grey', lg: 'secondary' },
    }))
  ).toEqual(JSON.stringify({
    fontSize: 4,
    color: 'rebeccapurple',
    '@media screen and (min-width: 480px)': {
      fontSize: 8,
    },
    '@media screen and (min-width: 768px)': {
      color: 'rebeccapurple',
    },
    '@media screen and (min-width: 1024px)': {
      fontSize: 32,
    },
  }))

  // expect(
  //   JSON.stringify(parser({
  //     theme: {
  //       ...theme,
  //       breakpoints: ['480px', '768px', '1024px'],
  //       disableStyledSystemCache: true,
  //     },
  //     fontSize: [1, 2, null, 4],
  //     color: ['primary', null, null, 'secondary'],
  //   }))
  // ).toEqual(JSON.stringify({
  //   fontSize: 4,
  //   color: 'rebeccapurple',
  //   '@media screen and (min-width: 480px)': {
  //     fontSize: 8,
  //   },
  //   '@media screen and (min-width: 768px)': {

  //   },
  //   '@media screen and (min-width: 50em)': {
  //     fontSize: 16,
  //   },
  //   '@media screen and (min-width: 100em)': {
  //     fontSize: 32,
  //     color: 'papayawhip',
  //   },
  // }))
})
