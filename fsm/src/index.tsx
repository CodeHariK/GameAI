/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import Examples from './ui/examples.tsx'

const root = document.getElementById('root')

render(() => <Examples />, root!)
