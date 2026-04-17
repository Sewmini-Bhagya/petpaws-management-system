import {
  overlay,
  card,
  left,
  imageStyle,
  right
} from "../styles/authStyles";

function AuthLayout({ image, children }) {
  return (
    <div style={overlay}>
      <div style={card}>
        <div style={left}>
          <img src={image} alt="auth" style={imageStyle} />
        </div>

        <div style={right}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;