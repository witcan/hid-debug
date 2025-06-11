import './App.css'
import LayoutRoot from './components/Layout/LayoutRoot';
import { HandleDeviceProvider } from './components/HID/HandleDeviceContext';
function App() {
  return (
    <>
      <HandleDeviceProvider>
        <LayoutRoot></LayoutRoot>
      </HandleDeviceProvider>
    </>
  )
}

export default App
