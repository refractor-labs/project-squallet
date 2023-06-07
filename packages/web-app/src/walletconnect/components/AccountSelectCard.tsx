import { truncate } from '@/walletconnect/utils/HelperUtil'
import { Card, Checkbox, Row, Text } from '@nextui-org/react'

/**
 * Types
 */
interface IProps {
  address: string
  index: number
  selected: boolean
  onSelect: () => void
}

/**
 * Component
 */
export default function AccountSelectCard({ address, selected, index, onSelect }: IProps) {
  console.log('AccountSelectCard', { address, selected, index, onSelect })
  return (
    <div onClick={onSelect}>
      <Card
        key={address}
        css={{
          marginTop: '$5',
          backgroundColor: selected ? 'rgba(23, 200, 100, 0.2)' : '$accents2'
        }}
      >
        Z
        <Row justify="space-between" align="center">
          {/*<input type={'checkbox'} checked={selected} />*/}
          <Checkbox aria-label={'checked'} size="lg" color="success" checked={selected} />

          <Text>{`${truncate(address, 14)} - Account ${index + 1}`} </Text>
        </Row>
      </Card>
    </div>
  )
}
