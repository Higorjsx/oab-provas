import { useEffect, useMemo, useState, type JSX } from 'react'

interface Exam {
  nome: string
  ano: string
  instituicao: string
  prova: string
  gabarito: string
}

function normalizePath(path: string) {
  return '/' + path.replace(/\\/g, '/').replace(/^\/+/, '')
}

function capitalizeWords(text: string) {
  return text.replace(/(^|\s)([a-zA-Z])/g, (match) => match.toUpperCase())
}

export default function App(): JSX.Element {
  const [data, setData] = useState<Exam[]>([])
  const [query, setQuery] = useState('')
  const [showOnlyYear, setShowOnlyYear] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  // const [darkMode] = useState(false);

  useEffect(() => {
    fetch('/pairs.json')
      .then((res) => res.json())
      .then((json: Exam[]) => setData(json))
      .catch((err) => console.error('Erro ao carregar JSON:', err))
      .finally(() => setLoading(false))
  }, [])

  //useEffect(() => {
  //   if (darkMode) {
  //  document.documentElement.classList.add("dark");
  // } else {
  //    document.documentElement.classList.remove("dark");
  //  }
  //}, [darkMode]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data
      .filter((item) => {
        if (showOnlyYear && item.ano !== showOnlyYear) return false
        if (!q) return true
        return (
          item.nome.toLowerCase().includes(q) ||
          item.ano.toLowerCase().includes(q) ||
          item.instituicao.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => Number(b.ano) - Number(a.ano))
  }, [query, showOnlyYear, data])

  const years = useMemo(() => {
    const s = new Set(data.map((d) => d.ano))
    return Array.from(s).sort((a, b) => Number(b) - Number(a))
  }, [data])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-10 transition-colors">
      <header className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 animate-fade-in">
            Banco de Provas
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 animate-fade-in">
            Pesquise por nome, ano ou instituição.
          </p>
        </div>

        {/* <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          {darkMode ? "🌞 Claro" : "🌙 Escuro"}
        </button> */}
      </header>

      <section className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row gap-3 sm:items-center">
        <label className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar... ex: civil, 2021, FGV"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Limpar pesquisa"
            >
              ×
            </button>
          )}
        </label>

        <div className="flex items-center gap-2">
          <select
            value={showOnlyYear ?? ''}
            onChange={(e) => setShowOnlyYear(e.target.value || null)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 shadow-sm transition text-gray-800 dark:text-gray-200"
            aria-label="Filtrar por ano"
          >
            <option value="">Todos os anos</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Resultados:{' '}
            <strong className="text-gray-800 dark:text-gray-100">
              {filtered.length}
            </strong>
          </span>
        </div>
      </section>

      <main className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400 animate-fade-in">
            Nenhum resultado encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((item, i) => (
              <article
                key={item.nome}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100 break-words">
                      {capitalizeWords(item.nome.replace(/-/g, ' '))}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.instituicao} • {item.ano}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-xs px-2 py-1 rounded-full">
                      {item.ano}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <a
                    href={normalizePath(item.prova)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-800 dark:text-gray-200"
                  >
                    Abrir Prova
                  </a>

                  <a
                    href={normalizePath(item.gabarito)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                  >
                    Gabarito
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto mt-8 text-center text-xs text-gray-400 dark:text-gray-500 animate-fade-in">
        &copy; {new Date().getFullYear()} Banco de Provas. Todos os direitos
        reservados. | Desenvolvido por Higor 👍
      </footer>
    </div>
  )
}
