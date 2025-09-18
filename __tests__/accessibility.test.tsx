/**
 * Tests d'accessibilité pour assurer la conformité WCAG
 * et une expérience utilisateur inclusive
 */

import { render, screen, fireEvent } from "@testing-library/react"
import { focusManager, screenReaderAnnouncer, colorContrastUtils, AccessibleContainer } from "@/lib/accessibility-utils"
import { AccessibilityTestUtils } from "@/lib/test-utils"

describe("Accessibility Tests", () => {
  afterEach(() => {
    // Clean up any DOM modifications
    document.body.innerHTML = ""
  })

  describe("Focus Management", () => {
    test("traps focus within modal correctly", () => {
      const modal = document.createElement("div")
      modal.innerHTML = `
        <button>First Button</button>
        <input type="text" placeholder="Input" />
        <button>Last Button</button>
      `
      document.body.appendChild(modal)

      const cleanup = focusManager.trapFocus(modal)

      // First element should be focused
      expect(document.activeElement).toBe(modal.querySelector("button"))

      // Tab to next element
      fireEvent.keyDown(document.activeElement!, { key: "Tab" })
      expect(document.activeElement).toBe(modal.querySelector("input"))

      // Tab to last element
      fireEvent.keyDown(document.activeElement!, { key: "Tab" })
      expect(document.activeElement).toBe(modal.querySelectorAll("button")[1])

      // Tab should wrap to first element
      fireEvent.keyDown(document.activeElement!, { key: "Tab" })
      expect(document.activeElement).toBe(modal.querySelector("button"))

      cleanup()
    })

    test("handles arrow navigation correctly", () => {
      const list = document.createElement("ul")
      list.innerHTML = `
        <li><button>Item 1</button></li>
        <li><button>Item 2</button></li>
        <li><button>Item 3</button></li>
      `
      document.body.appendChild(list)

      const cleanup = focusManager.handleArrowNavigation(list, "vertical")

      // Focus first item
      const firstButton = list.querySelector("button")!
      firstButton.focus()

      // Arrow down should move to next item
      fireEvent.keyDown(firstButton, { key: "ArrowDown" })
      expect(document.activeElement).toBe(list.querySelectorAll("button")[1])

      // Arrow up should move to previous item
      fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" })
      expect(document.activeElement).toBe(firstButton)

      // Home should move to first item
      fireEvent.keyDown(document.activeElement!, { key: "Home" })
      expect(document.activeElement).toBe(firstButton)

      // End should move to last item
      fireEvent.keyDown(document.activeElement!, { key: "End" })
      expect(document.activeElement).toBe(list.querySelectorAll("button")[2])

      cleanup()
    })

    test("gets focusable elements correctly", () => {
      const container = document.createElement("div")
      container.innerHTML = `
        <button>Button</button>
        <input type="text" />
        <button disabled>Disabled Button</button>
        <a href="#">Link</a>
        <div tabindex="0">Focusable Div</div>
        <div tabindex="-1">Non-focusable Div</div>
      `
      document.body.appendChild(container)

      const focusableElements = focusManager.getFocusableElements(container)

      expect(focusableElements).toHaveLength(4) // button, input, link, focusable div
      expect(focusableElements[0].tagName).toBe("BUTTON")
      expect(focusableElements[1].tagName).toBe("INPUT")
      expect(focusableElements[2].tagName).toBe("A")
      expect(focusableElements[3].getAttribute("tabindex")).toBe("0")
    })
  })

  describe("Screen Reader Announcements", () => {
    test("creates live region correctly", () => {
      expect(document.querySelector("[aria-live]")).toBeTruthy()
    })

    test("announces messages correctly", () => {
      const liveRegion = document.querySelector("[aria-live]") as HTMLElement

      screenReaderAnnouncer.announce("Test message", "polite")

      expect(liveRegion.getAttribute("aria-live")).toBe("polite")
      expect(liveRegion.textContent).toBe("Test message")

      // Message should be cleared after timeout
      setTimeout(() => {
        expect(liveRegion.textContent).toBe("")
      }, 1100)
    })

    test("handles different priority levels", () => {
      const liveRegion = document.querySelector("[aria-live]") as HTMLElement

      screenReaderAnnouncer.announce("Urgent message", "assertive")
      expect(liveRegion.getAttribute("aria-live")).toBe("assertive")

      screenReaderAnnouncer.announce("Normal message", "polite")
      expect(liveRegion.getAttribute("aria-live")).toBe("polite")
    })

    test("announces success and error messages", () => {
      const liveRegion = document.querySelector("[aria-live]") as HTMLElement

      screenReaderAnnouncer.announceSuccess("Operation completed")
      expect(liveRegion.textContent).toBe("Succès: Operation completed")

      screenReaderAnnouncer.announceError("Something went wrong")
      expect(liveRegion.textContent).toBe("Erreur: Something went wrong")
      expect(liveRegion.getAttribute("aria-live")).toBe("assertive")
    })
  })

  describe("Color Contrast", () => {
    test("calculates contrast ratios correctly", () => {
      // Black on white should have high contrast
      const blackWhiteRatio = colorContrastUtils.calculateContrastRatio("#000000", "#FFFFFF")
      expect(blackWhiteRatio).toBeCloseTo(21, 0)

      // Same colors should have ratio of 1
      const sameColorRatio = colorContrastUtils.calculateContrastRatio("#FF0000", "#FF0000")
      expect(sameColorRatio).toBeCloseTo(1, 0)

      // Test with brand colors
      const brandRatio = colorContrastUtils.calculateContrastRatio("#E91E63", "#FFFFFF")
      expect(brandRatio).toBeGreaterThan(3) // Should meet AA standard for large text
    })

    test("validates WCAG standards correctly", () => {
      // High contrast combinations
      expect(colorContrastUtils.meetsWCAGStandards("#000000", "#FFFFFF", "AA", "normal")).toBe(true)
      expect(colorContrastUtils.meetsWCAGStandards("#000000", "#FFFFFF", "AAA", "normal")).toBe(true)

      // Low contrast combinations
      expect(colorContrastUtils.meetsWCAGStandards("#CCCCCC", "#FFFFFF", "AA", "normal")).toBe(false)
      expect(colorContrastUtils.meetsWCAGStandards("#CCCCCC", "#FFFFFF", "AA", "large")).toBe(false)

      // Brand color tests
      expect(colorContrastUtils.meetsWCAGStandards("#E91E63", "#FFFFFF", "AA", "large")).toBe(true)
    })

    test("suggests better contrast colors", () => {
      const poorContrast = "#CCCCCC"
      const background = "#FFFFFF"

      const betterColor = colorContrastUtils.suggestBetterContrast(poorContrast, background, 4.5)
      const newRatio = colorContrastUtils.calculateContrastRatio(betterColor, background)

      expect(newRatio).toBeGreaterThanOrEqual(4.5)
      expect(betterColor).not.toBe(poorContrast)
    })
  })

  describe("Accessible Components", () => {
    test("AccessibleContainer handles focus trapping", () => {
      const TestComponent = () => (
        <AccessibleContainer trapFocus={true} ariaLabel="Test Modal">
          <button>Button 1</button>
          <button>Button 2</button>
        </AccessibleContainer>
      )

      render(<TestComponent />)

      const container = screen.getByLabelText("Test Modal")
      expect(container).toBeInTheDocument()

      // First button should be focused
      expect(document.activeElement).toBe(screen.getByText("Button 1"))
    })

    test("AccessibleContainer announces on mount", () => {
      const liveRegion = document.querySelector("[aria-live]") as HTMLElement

      const TestComponent = () => (
        <AccessibleContainer announceOnMount="Modal opened">
          <div>Content</div>
        </AccessibleContainer>
      )

      render(<TestComponent />)

      expect(liveRegion.textContent).toBe("Modal opened")
    })
  })

  describe("Form Accessibility", () => {
    test("form fields have proper labels", () => {
      const FormComponent = () => (
        <form>
          <label htmlFor="name">Nom</label>
          <input id="name" type="text" />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" />

          <button type="submit">Soumettre</button>
        </form>
      )

      render(<FormComponent />)

      const nameInput = screen.getByLabelText("Nom")
      const emailInput = screen.getByLabelText("Email")

      expect(nameInput).toBeInTheDocument()
      expect(emailInput).toBeInTheDocument()
      expect(nameInput.getAttribute("id")).toBe("name")
      expect(emailInput.getAttribute("id")).toBe("email")
    })

    test("form validation errors are announced", () => {
      const FormComponent = () => (
        <form>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" aria-describedby="email-error" aria-invalid="true" />
          <div id="email-error" role="alert">
            Veuillez entrer une adresse email valide
          </div>
        </form>
      )

      render(<FormComponent />)

      const emailInput = screen.getByLabelText("Email")
      const errorMessage = screen.getByRole("alert")

      expect(emailInput.getAttribute("aria-invalid")).toBe("true")
      expect(emailInput.getAttribute("aria-describedby")).toBe("email-error")
      expect(errorMessage).toHaveTextContent("Veuillez entrer une adresse email valide")
    })
  })

  describe("Table Accessibility", () => {
    test("tables have proper headers and structure", () => {
      const TableComponent = () => (
        <table>
          <caption>Liste des clients</caption>
          <thead>
            <tr>
              <th scope="col">Nom</th>
              <th scope="col">Email</th>
              <th scope="col">Téléphone</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Jean Dupont</td>
              <td>jean@example.com</td>
              <td>514-555-0123</td>
            </tr>
          </tbody>
        </table>
      )

      render(<TableComponent />)

      const table = screen.getByRole("table")
      const caption = screen.getByText("Liste des clients")
      const headers = screen.getAllByRole("columnheader")

      expect(table).toBeInTheDocument()
      expect(caption).toBeInTheDocument()
      expect(headers).toHaveLength(3)
      expect(headers[0]).toHaveAttribute("scope", "col")
    })
  })

  describe("Navigation Accessibility", () => {
    test("navigation has proper landmarks", () => {
      const NavigationComponent = () => (
        <nav aria-label="Navigation principale">
          <ul>
            <li>
              <a href="/dashboard">Tableau de bord</a>
            </li>
            <li>
              <a href="/clients">Clients</a>
            </li>
            <li>
              <a href="/appointments">Rendez-vous</a>
            </li>
          </ul>
        </nav>
      )

      render(<NavigationComponent />)

      const nav = screen.getByRole("navigation", { name: "Navigation principale" })
      const links = screen.getAllByRole("link")

      expect(nav).toBeInTheDocument()
      expect(links).toHaveLength(3)
    })

    test("skip links are available", () => {
      const PageComponent = () => (
        <div>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Aller au contenu principal
          </a>
          <nav>Navigation</nav>
          <main id="main-content">
            <h1>Contenu principal</h1>
          </main>
        </div>
      )

      render(<PageComponent />)

      const skipLink = screen.getByText("Aller au contenu principal")
      expect(skipLink).toBeInTheDocument()
      expect(skipLink.getAttribute("href")).toBe("#main-content")
    })
  })

  describe("Keyboard Navigation Integration", () => {
    test("full page keyboard navigation works", async () => {
      const FullPageComponent = () => (
        <div>
          <nav>
            <button>Menu</button>
            <a href="/home">Accueil</a>
          </nav>
          <main>
            <h1>Titre principal</h1>
            <form>
              <input type="text" placeholder="Recherche" />
              <button type="submit">Rechercher</button>
            </form>
          </main>
        </div>
      )

      render(<FullPageComponent />)

      const container = document.body
      await AccessibilityTestUtils.testKeyboardNavigation(container)
    })
  })
})
