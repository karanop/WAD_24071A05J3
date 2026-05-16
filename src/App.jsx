import { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

const STORAGE_KEYS = {
  users: "pharmacy_users",
  activeUser: "pharmacy_active_user",
  cart: "pharmacy_cart",
  orders: "pharmacy_orders",
};

const medicines = [
  { id: 1, name: "Paracetamol", price: 50, category: "Fever" },
  { id: 2, name: "Cough Syrup", price: 120, category: "Cold" },
  { id: 3, name: "Vitamin C", price: 180, category: "Supplements" },
  { id: 4, name: "Antacid Tablets", price: 90, category: "Digestion" },
  { id: 5, name: "Pain Relief Gel", price: 150, category: "Pain Care" },
  { id: 6, name: "Allergy Tablets", price: 110, category: "Allergy" },
];

function readStorage(key, fallback) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : fallback;
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function App() {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUsers(readStorage(STORAGE_KEYS.users, []));
    setActiveUser(readStorage(STORAGE_KEYS.activeUser, null));
    setCart(readStorage(STORAGE_KEYS.cart, []));
    setOrders(readStorage(STORAGE_KEYS.orders, []));
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    saveStorage(STORAGE_KEYS.users, users);
  }, [isReady, users]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    saveStorage(STORAGE_KEYS.activeUser, activeUser);
  }, [activeUser, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    saveStorage(STORAGE_KEYS.cart, cart);
  }, [cart, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    saveStorage(STORAGE_KEYS.orders, orders);
  }, [isReady, orders]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  function registerUser(formData) {
    const exists = users.some((user) => user.email === formData.email);
    if (exists) {
      return { ok: false, message: "Email already registered." };
    }

    const nextUsers = [...users, formData];
    setUsers(nextUsers);
    setActiveUser({ name: formData.name, email: formData.email });
    return { ok: true, message: "Registration successful." };
  }

  function loginUser(formData) {
    const match = users.find(
      (user) =>
        user.email === formData.email && user.password === formData.password
    );

    if (!match) {
      return { ok: false, message: "Invalid email or password." };
    }

    setActiveUser({ name: match.name, email: match.email });
    return { ok: true, message: "Login successful." };
  }

  function logoutUser() {
    setActiveUser(null);
  }

  function addToCart(medicine) {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === medicine.id);
      if (existing) {
        return currentCart.map((item) =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...medicine, quantity: 1 }];
    });
  }

  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      setCart((currentCart) => currentCart.filter((item) => item.id !== id));
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }

  function placeOrder() {
    if (!activeUser) {
      return { ok: false, message: "Please log in before placing an order." };
    }

    if (!cart.length) {
      return { ok: false, message: "Your cart is empty." };
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const order = {
      id: orderId,
      customer: activeUser,
      items: cart,
      total,
      status: "Processing",
      createdAt: new Date().toLocaleString(),
      eta: "2-3 days",
    };

    setOrders((currentOrders) => [order, ...currentOrders]);
    setCart([]);
    return { ok: true, order };
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          PharmaCart
        </Link>
        <nav className="nav">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/register">Register</NavItem>
          <NavItem to="/login">Login</NavItem>
          <NavItem to="/catalog">Catalog</NavItem>
          <NavItem to="/cart">Cart ({cartCount})</NavItem>
          <NavItem to="/track">Track Order</NavItem>
          <NavItem to="/contact">Contact</NavItem>
        </nav>
        <div className="user-chip">
          {activeUser ? (
            <>
              <span>{activeUser.name}</span>
              <button className="link-button" onClick={logoutUser}>
                Logout
              </button>
            </>
          ) : (
            <span>Guest</span>
          )}
        </div>
      </header>

      <main className="page-wrap">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/register"
            element={<RegisterPage onRegister={registerUser} />}
          />
          <Route path="/login" element={<LoginPage onLogin={loginUser} />} />
          <Route
            path="/catalog"
            element={<CatalogPage medicines={medicines} onAddToCart={addToCart} />}
          />
          <Route
            path="/cart"
            element={
              <CartPage
                cart={cart}
                activeUser={activeUser}
                onUpdateQuantity={updateQuantity}
                onPlaceOrder={placeOrder}
              />
            }
          />
          <Route path="/track" element={<TrackPage orders={orders} />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
    >
      {children}
    </NavLink>
  );
}

function Page({ title, subtitle, children }) {
  return (
    <section className="page">
      <div className="page-head">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function HomePage() {
  return (
    <Page
      title="Online Pharmacy"
      subtitle="A minimal demo for medicine ordering and tracking."
    >
      <div className="card">
        <p>Register or log in, browse medicines, add items to cart, and place a simple order.</p>
        <Link className="button" to="/catalog">
          View Catalog
        </Link>
      </div>
    </Page>
  );
}

function RegisterPage({ onRegister }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const result = onRegister(payload);
    setMessage(result.message);
    if (result.ok) {
      event.currentTarget.reset();
      navigate("/catalog");
    }
  }

  return (
    <Page title="Register" subtitle="Create a simple demo account.">
      <FormCard onSubmit={handleSubmit}>
        <input name="name" type="text" placeholder="Full name" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button className="button" type="submit">
          Register
        </button>
        {message ? <p className="message">{message}</p> : null}
      </FormCard>
    </Page>
  );
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const result = onLogin(payload);
    setMessage(result.message);
    if (result.ok) {
      event.currentTarget.reset();
      navigate("/catalog");
    }
  }

  return (
    <Page title="Login" subtitle="Use the account you registered locally.">
      <FormCard onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button className="button" type="submit">
          Login
        </button>
        {message ? <p className="message">{message}</p> : null}
      </FormCard>
    </Page>
  );
}

function CatalogPage({ medicines, onAddToCart }) {
  return (
    <Page title="Medicine Catalog" subtitle="Basic medicine listing with add-to-cart support.">
      <div className="grid">
        {medicines.map((medicine) => (
          <article className="card" key={medicine.id}>
            <h2>{medicine.name}</h2>
            <p>{medicine.category}</p>
            <strong>{formatCurrency(medicine.price)}</strong>
            <button className="button" onClick={() => onAddToCart(medicine)}>
              Add to Cart
            </button>
          </article>
        ))}
      </div>
    </Page>
  );
}

function CartPage({ cart, activeUser, onUpdateQuantity, onPlaceOrder }) {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [message, setMessage] = useState("");

  function handleCheckout() {
    const result = onPlaceOrder();
    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setMessage(`Order placed: ${result.order.id}`);
    navigate(`/track?orderId=${result.order.id}`);
  }

  return (
    <Page title="Cart" subtitle="Review items before placing an order.">
      <div className="stack">
        {!activeUser ? (
          <div className="card">
            <p>Please log in before checkout.</p>
          </div>
        ) : null}

        {cart.length ? (
          cart.map((item) => (
            <div className="card row" key={item.id}>
              <div>
                <h2>{item.name}</h2>
                <p>{formatCurrency(item.price)} each</p>
              </div>
              <div className="qty-control">
                <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                  +
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="card">
            <p>Your cart is empty.</p>
          </div>
        )}

        <div className="card">
          <strong>Total: {formatCurrency(total)}</strong>
          <button className="button" onClick={handleCheckout}>
            Place Order
          </button>
          {message ? <p className="message">{message}</p> : null}
        </div>
      </div>
    </Page>
  );
}

function TrackPage({ orders }) {
  const location = useLocation();
  const queryId = new URLSearchParams(location.search).get("orderId") || "";
  const [searchId, setSearchId] = useState(queryId);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (queryId) {
      const match = orders.find((order) => order.id === queryId);
      setResult(match || null);
    }
  }, [orders, queryId]);

  function handleSearch(event) {
    event.preventDefault();
    const match = orders.find((order) => order.id === searchId.trim());
    setResult(match || false);
  }

  return (
    <Page title="Order Tracking" subtitle="Search using your generated order ID.">
      <FormCard onSubmit={handleSearch}>
        <input
          type="text"
          value={searchId}
          onChange={(event) => setSearchId(event.target.value)}
          placeholder="Enter order ID"
        />
        <button className="button" type="submit">
          Track
        </button>
      </FormCard>

      {result && (
        <div className="card">
          <h2>{result.id}</h2>
          <p>Status: {result.status}</p>
          <p>Placed: {result.createdAt}</p>
          <p>ETA: {result.eta}</p>
          <p>Total: {formatCurrency(result.total)}</p>
        </div>
      )}

      {result === false && (
        <div className="card">
          <p>No order found for that ID.</p>
        </div>
      )}

      {orders.length ? (
        <div className="card">
          <h2>Recent Orders</h2>
          <div className="list">
            {orders.map((order) => (
              <div className="list-item" key={order.id}>
                <span>{order.id}</span>
                <span>{order.status}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Page>
  );
}

function ContactPage() {
  return (
    <Page title="Contact" subtitle="Minimal contact details for pharmacy support.">
      <div className="card">
        <p>Email: support@pharmacart.demo</p>
        <p>Phone: +91 98765 43210</p>
        <p>Hours: 9:00 AM - 8:00 PM</p>
      </div>
    </Page>
  );
}

function FormCard({ children, onSubmit }) {
  return (
    <form className="card form-card" onSubmit={onSubmit}>
      {children}
    </form>
  );
}

export default App;
