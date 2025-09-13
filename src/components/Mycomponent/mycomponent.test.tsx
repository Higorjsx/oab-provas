import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Mycomponent } from '.'

describe('<Mycomponent />', () => {
  test('should render component', () => {
    render(<Mycomponent />)
    expect(screen.getByText('Mycomponent')).toBeInTheDocument()
  })
})
