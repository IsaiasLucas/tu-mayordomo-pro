import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.25'
import * as React from 'https://esm.sh/react@18.3.1'

interface Props {
  confirmation_url: string
}

export const ConfirmSignupEmail = ({ confirmation_url }: Props) => (
  <Html>
    <Head />
    <Preview>Confirma tu correo para activar tu cuenta</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={brand}>Tu Mayordomo 🤖</Heading>
        </Section>

        <Section style={content}>
          <Heading as="h2" style={title}>Confirma tu correo electrónico</Heading>
          <Text style={p}>¡Hola! Falta un paso para activar tu cuenta y comenzar a controlar tus finanzas con Tu Mayordomo.</Text>
          <Text style={p}>Haz clic en el siguiente botón para confirmar tu correo y empezar:</Text>
          <Link href={confirmation_url} target="_blank" style={button}>
            Confirmar mi correo
          </Link>
          <Hr style={hr} />
          <Text style={small}>
            Si el botón no funciona, copia y pega este enlace en tu navegador:
            <br />
            <Link href={confirmation_url} target="_blank" style={link}>{confirmation_url}</Link>
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={small}>Si no creaste una cuenta en Tu Mayordomo, puedes ignorar este mensaje.</Text>
          <Text style={muted}>Gracias por hacer parte de esta comunidad 💚 | Gestión financiera por IA 🇨🇱</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ConfirmSignupEmail

const main = { backgroundColor: '#f7f5ff', color: '#333', margin: 0 }
const container = { maxWidth: '560px', margin: '40px auto', background: '#fff', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }
const header = { backgroundColor: '#9d75f0', textAlign: 'center' as const, padding: '24px 20px' }
const brand = { color: '#fff', fontSize: '22px', margin: 0 }
const content = { padding: '30px 25px', textAlign: 'center' as const }
const title = { color: '#4a1fb8', margin: '0 0 10px', fontSize: '22px' }
const p = { fontSize: '15px', color: '#555', lineHeight: 1.6 as const, margin: '0 0 20px' }
const button = { display: 'inline-block', backgroundColor: '#7e55e7', color: '#fff', textDecoration: 'none', padding: '14px 26px', borderRadius: '30px', fontWeight: 600, fontSize: '15px' }
const link = { color: '#7e55e7', textDecoration: 'underline' }
const hr = { borderColor: '#eee', margin: '24px 0' }
const footer = { background: '#faf8ff', textAlign: 'center' as const, padding: '20px' }
const small = { fontSize: '12px', color: '#777' }
const muted = { fontSize: '12px', color: '#999' }
