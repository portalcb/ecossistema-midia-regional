import { loginAction } from './actions';

export default async function Login({searchParams}:{searchParams:Promise<{erro?:string}>}){
  const query=await searchParams;
  const error=query.erro==='limite'
    ?'Não foi possível entrar agora. Aguarde alguns minutos e tente novamente.'
    :query.erro?'E-mail ou senha inválidos.':'';
  return <main className="login-wrap"><section className="login-card"><div className="brand"><span className="mark">MR</span><span>MÍDIA REGIONAL</span></div><span className="kicker">Gestão editorial</span><h1>Entrar no painel</h1><p className="muted">Acesso reservado à equipe autorizada.</p>{error&&<p role="alert" className="login-error">{error}</p>}<form action={loginAction} className="form-stack"><label>E-mail<input name="email" type="email" autoComplete="email" required/></label><label>Senha<input name="password" type="password" autoComplete="current-password" required minLength={8}/></label><button className="btn dark" type="submit">Entrar</button></form></section></main>;
}
