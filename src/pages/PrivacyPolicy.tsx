const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800 bg-white shadow-lg my-10 rounded-lg">
      <h1 className="text-3xl font-bold mb-6">
        Política de Privacidad - Car Advisor Pro
      </h1>
      <p className="mb-4">
        Última actualización: {new Date().toLocaleDateString()}
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Información General</h2>
        <p>
          En <strong>caradvisorpro.es</strong>, accesible desde nuestra URL
          principal, una de nuestras principales prioridades es la privacidad de
          nuestros visitantes. Este documento de Política de Privacidad contiene
          tipos de información que son recogidos y registrados por nuestro sitio
          y cómo los utilizamos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          2. Archivos de Registro (Log Files)
        </h2>
        <p>
          Car Advisor Pro sigue un procedimiento estándar de uso de archivos de
          registro. Estos archivos registran a los visitantes cuando visitan
          sitios web. La información recogida por los archivos de registro
          incluye direcciones de protocolo de Internet (IP), tipo de navegador,
          proveedor de servicios de Internet (ISP), marca de tiempo, páginas de
          referencia/salida y posiblemente el número de clics.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          3. Cookies de Google DoubleClick DART
        </h2>
        <p>
          Google es uno de los proveedores externos en nuestro sitio. También
          utiliza cookies, conocidas como cookies de DART, para servir anuncios
          a los visitantes de nuestro sitio basados en su visita a
          www.caradvisorpro.es y otros sitios en Internet.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          4. Nuestros Socios Publicitarios
        </h2>
        <p>
          Algunos de los anunciantes en nuestro sitio pueden utilizar cookies y
          web beacons. Nuestro socio publicitario principal es{' '}
          <strong>Google AdSense</strong>. Cada uno de nuestros socios
          publicitarios tiene su propia Política de Privacidad para sus
          políticas sobre los datos de los usuarios.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Consentimiento</h2>
        <p>
          Al utilizar nuestro sitio web, usted acepta nuestra Política de
          Privacidad y está de acuerdo con sus términos y condiciones.
        </p>
      </section>

      <p className="text-sm text-gray-500 mt-10">
        Contacto: juanzamudiofdez@gmail.com
      </p>
    </div>
  );
};

export default PrivacyPolicy;
