import { IndexPage } from "../../views/IndexPage";
import { useAuth } from "../../providers/AuthProvider";

export default function index() {
  const { logout } = useAuth();

  return <IndexPage logout={logout} />;
}
