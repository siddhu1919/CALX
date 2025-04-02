import { ColorSwatch, Group, Slider } from "@mantine/core";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import Draggable from "react-draggable";
import { SWATCHES } from "@/constants";
import { Sidebar } from "@/components/Sidebar";
import { toast } from "react-hot-toast";
import { Eraser } from "lucide-react";
// import {LazyBrush} from 'lazy-brush';

interface GeneratedResult {
  expression: string;
  answer: string;
}

interface Response {
  expr: string;
  result: string;
  assign: boolean;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("rgb(255, 255, 255)");
  const [reset, setReset] = useState(false);
  const [dictOfVars, setDictOfVars] = useState({});
  const [result, setResult] = useState<GeneratedResult>();
  const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
  const [latexExpression, setLatexExpression] = useState<Array<string>>([]);
  const [isEraser, setIsEraser] = useState(false);
  const [eraserSize, setEraserSize] = useState(20);
  const [pages, setPages] = useState<Array<{ id: string; name: string; thumbnail: string; content: string }>>([]);
  const [currentPage, setCurrentPage] = useState<{ id: string; name: string; thumbnail: string; content: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // const lazyBrush = new LazyBrush({
  //     radius: 10,
  //     enabled: true,
  //     initialPoint: { x: 0, y: 0 },
  // });


  useEffect(() => {
    if (latexExpression.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
      }, 0);
    }
  }, [latexExpression]);

  useEffect(() => {
    if (result) {
      renderLatexToCanvas(result.expression, result.answer);
    }
  }, [result]);

  useEffect(() => {
    if (reset) {
      resetCanvas();
      setLatexExpression([]);
      setResult(undefined);
      setDictOfVars({});
      setReset(false);
    }
  }, [reset]);

  const saveCurrentPage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPage) return;

    const thumbnail = canvas.toDataURL();
    const content = canvas.toDataURL();
    const updatedPage = { ...currentPage, thumbnail, content };
    setPages(pages.map(p => p.id === currentPage.id ? updatedPage : p));
    localStorage.setItem('pages', JSON.stringify(pages.map(p => p.id === currentPage.id ? updatedPage : p)));
    setHasUnsavedChanges(false);
    toast.success('Changes saved');
  }, [currentPage, pages]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [saveCurrentPage]);
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsEraser(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEraser]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(saveCurrentPage, 3000);
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, saveCurrentPage]);

  useEffect(() => {
    const savedPages = localStorage.getItem('pages');
    const lastActivePageId = localStorage.getItem('lastActivePageId');
    if (savedPages) {
      const parsedPages = JSON.parse(savedPages);
      setPages(parsedPages);
      if (parsedPages.length > 0) {
        const lastActivePage = lastActivePageId ? parsedPages.find(p => p.id === lastActivePageId) : null;
        setCurrentPage(lastActivePage || parsedPages[0]);
      }
    } else {
      const defaultPage = {
        id: '1',
        name: 'Untitled Page',
        thumbnail: '',
        content: ''
      };
      setPages([defaultPage]);
      setCurrentPage(defaultPage);
      localStorage.setItem('pages', JSON.stringify([defaultPage]));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - canvas.offsetTop;
        ctx.lineCap = "round";
        ctx.lineWidth = isEraser ? eraserSize : 3;
        if (currentPage?.content) {
          const img = new Image();
          img.src = currentPage.content;
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
        }
      }
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
          ],
        },
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [currentPage]);

  const renderLatexToCanvas = (expression: string, answer: string) => {
    const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
    setLatexExpression([...latexExpression, latex]);

    // Clear the main canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.background = "black";
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
      }
    }
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (isEraser) {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = color;
        }
        ctx.lineWidth = isEraser ? eraserSize : 3;
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
        setHasUnsavedChanges(true);
      }
    }
  };

  const handlePageCreate = (name: string) => {
    if (hasUnsavedChanges) {
      saveCurrentPage();
    }
    const pageNumber = pages.length + 1;
    const defaultName = name.trim() || `Page ${pageNumber}`;
    const newPage = {
      id: Date.now().toString(),
      name: defaultName,
      thumbnail: '',
      content: ''
    };
    setPages([...pages, newPage]);
    setCurrentPage(newPage);
    localStorage.setItem('pages', JSON.stringify([...pages, newPage]));
    resetCanvas();
  };

  const handlePageSelect = (page: typeof currentPage) => {
    if (hasUnsavedChanges) {
      saveCurrentPage();
    }
    setCurrentPage(page);
    localStorage.setItem('lastActivePageId', page?.id || '');
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx && page?.content) {
        const img = new Image();
        img.src = page.content;
        console.log("hi");
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
      }
    }
  };
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const runRoute = async () => {
    const canvas = canvasRef.current;

    if (canvas) {
      const response = await axios({
        method: "post",
        url: `${import.meta.env.VITE_API_URL}/calculate`,
        data: {
          image: canvas.toDataURL("image/png"),
          dict_of_vars: dictOfVars,
        },
      });

      const resp = await response.data;
      console.log("Response", resp);
      resp.data.forEach((data: Response) => {
        if (data.assign === true) {
          // dict_of_vars[resp.result] = resp.answer;
          setDictOfVars({
            ...dictOfVars,
            [data.expr]: data.result,
          });
        }
      });
      const ctx = canvas.getContext("2d");
      const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
      let minX = canvas.width,
        minY = canvas.height,
        maxX = 0,
        maxY = 0;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          if (imageData.data[i + 3] > 0) {
            // If pixel is not transparent
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      setLatexPosition({ x: centerX, y: centerY });
      resp.data.forEach((data: Response) => {
        setTimeout(() => {
          setResult({
            expression: data.expr,
            answer: data.result,
          });
        }, 1000);
      });
    }
  };

  return (
    <>
      <Sidebar
        currentPage={currentPage}
        pages={pages}
        onPageSelect={handlePageSelect}
        onPageCreate={handlePageCreate}
      />
      <div className=" flex justify-around py-5 gap-2 ml-16">
        <Button
          onClick={() => setReset(true)}
          className="z-20 bg-black text-white"
          variant="default"
          color="black"
        >
          Reset
        </Button>
        <Group className="z-20">
          {SWATCHES.map((swatch) => (
            <ColorSwatch
              key={swatch}
              color={swatch}
              onClick={() => {
                setColor(swatch);
                setIsEraser(false);
              }}
            />
          ))}
        </Group>
        <div className="z-20 flex items-center gap-2">
          <Button
            onClick={() => setIsEraser(!isEraser)}
            className={`bg-black text-white ${isEraser ? 'bg-gray-700' : ''}`}
            variant="default"
          >
            <Eraser size={20} />
          </Button>
          {isEraser && (
            <Slider
              value={eraserSize}
              onChange={setEraserSize}
              min={5}
              max={50}
              label={(value) => `${value}px`}
              className="w-32"
            />
          )}
        </div>
        <Button
          onClick={runRoute}
          className="z-20 bg-black text-white"
          variant="default"
          color="white"
        >
          Run
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        id="canvas"
        className="absolute top-0 left-0 w-full h-full bg-black"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />

      {latexExpression &&
        latexExpression.map((latex, index) => (
          <Draggable
            key={index}
            defaultPosition={latexPosition}
            onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
          >
            <div className="absolute p-2 text-white rounded shadow-md">
              <div className="latex-content">{latex}</div>
            </div>
          </Draggable>
        ))}
    </>
  );
}
